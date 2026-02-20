import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WebhookService } from './webhook.service';

const prisma = new PrismaClient();
const webhookService = new WebhookService();

export class MessagingController {
    /**
     * Endpoint to send a new message.
     * We will create a `mensaje` record and dispatch a MESSAGE_CREATED webhook.
     */
    public async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const sender = (req as any).user;

            if (!sender) {
                res.status(401).json({ error: 'No autorizado' });
                return;
            }

            const { content, targetRole, targetUserId } = req.body;

            if (!content) {
                res.status(400).json({ error: 'El contenido del mensaje es requerido' });
                return;
            }

            // 1. Create the base Message Record
            const newMsg = await (prisma as any).mensaje.create({
                data: {
                    contenido: content,
                    id_emisor: sender.id_persona,
                    target_rol: targetRole || null,
                }
            });

            // 2. For DIRECT messages (1-on-1), create delivery records inline
            if (targetUserId) {
                // Verify target user exists
                const targetUser = await prisma.persona.findUnique({
                    where: { id_persona: targetUserId }
                });

                if (!targetUser) {
                    res.status(404).json({ error: 'El destinatario no existe.' });
                    return;
                }

                // Create delivery for the RECIPIENT
                await (prisma as any).mensaje_entrega.create({
                    data: {
                        id_mensaje: newMsg.id_mensaje,
                        id_receptor: targetUserId,
                        estado: 'PENDING'
                    }
                });

                // Create delivery for the SENDER (so they see their own sent message in conversation)
                await (prisma as any).mensaje_entrega.create({
                    data: {
                        id_mensaje: newMsg.id_mensaje,
                        id_receptor: sender.id_persona,
                        estado: 'READ' // Sender has already "read" their own message
                    }
                });

                console.log(`[sendMessage] Direct message delivered: ${sender.id_persona} -> ${targetUserId}`);
            } else {
                // 3. For BROADCAST messages, use the webhook pipeline
                const webhookPayload = {
                    event: 'MESSAGE_CREATED',
                    data: {
                        messageId: newMsg.id_mensaje,
                        content: newMsg.contenido,
                        senderId: sender.id_persona,
                        senderFacultyId: sender.id_facultad,
                        targetRole: targetRole,
                    }
                };
                webhookService.dispatch('MESSAGE_CREATED', webhookPayload).catch(e => console.error("Webhook Dispatch Error", e));
            }

            res.status(201).json({
                message: 'Mensaje enviado exitosamente',
                data: newMsg
            });
        } catch (error) {
            console.error('[sendMessage] Error:', error);
            res.status(500).json({ error: 'Error del servidor al enviar mensaje' });
        }
    }

    /**
     * Internal Webhook Consumer Endpoint
     * Listens for `MESSAGE_CREATED` payloads and creates individual Inbox Deliveries 
     * (mensaje_entrega) enforcing Faculty constraints (`id_facultad`).
     */
    public async consumeWebhook(req: Request, res: Response): Promise<void> {
        try {
            // Very basic security: A real implementation would verify signatures here.
            const secret = req.headers['x-webhook-secret'];
            if (secret !== process.env.WEBHOOK_SECRET && secret !== 'internal_secret') {
                res.status(403).json({ error: 'Invalid Webhook Signature' });
                return;
            }

            const { event, data } = req.body;
            if (event !== 'MESSAGE_CREATED' || !data) {
                // Acknowledge receipt but ignore irrelevant events so retries stop
                res.status(200).json({ status: 'Ignored' });
                return;
            }

            const { messageId, senderFacultyId, targetRole, targetUserId } = data;

            // Rule: Find all target users in the EXACT same faculty.
            const userFilters: any = {
                id_facultad: senderFacultyId
            };

            // Strict direct message logic
            if (targetUserId) {
                userFilters.id_persona = targetUserId;
            }

            // If a role was targeted (e.g., all Students in this faculty)
            if (targetRole) {
                // Assuming `tipo_rol` resolution exists via `actores` or a direct link. 
                // For simplicity in this architectural demo, we'll imagine users have a role property mapping.
                // Actually, we must traverse `actores` or check a user's role if the DB design uses `actores` mapping.
                // Let's just find all active personas in the same faculty as a broad receiver test for now if role is omitted.

                // Example implementation for complex roles could query specific `actores` tables.
            }

            // Fetch target recipients in the same faculty
            const recipients = await prisma.persona.findMany({
                where: userFilters,
                select: { id_persona: true }
            });

            // Create Deliveries recursively
            const deliveries = recipients.map(user => ({
                id_mensaje: messageId,
                id_receptor: user.id_persona,
                estado: 'PENDING'
            }));

            if (deliveries.length > 0) {
                await (prisma as any).mensaje_entrega.createMany({
                    data: deliveries,
                    skipDuplicates: true
                });
                console.log(`[Webhook Consume] Created ${deliveries.length} inbox deliveries for Message ${messageId} in Faculty ${senderFacultyId}`);
            }

            res.status(200).json({ status: 'Consumed', deliveredTo: deliveries.length });
        } catch (error) {
            console.error('[consumeWebhook] Error:', error);
            res.status(500).json({ error: 'Internal server error consuming webhook' });
        }
    }

    /**
     * Fetch the active user's inbox
     */
    public async getInbox(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            if (!user) {
                res.status(401).json({ error: 'No autorizado' });
                return;
            }

            const messages = await (prisma as any).mensaje_entrega.findMany({
                where: { id_receptor: user.id_persona },
                include: {
                    mensaje: {
                        include: {
                            emisor: {
                                select: {
                                    nombres: true,
                                    apellidos: true,
                                    correo_electronico: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    mensaje: { fecha_envio: 'desc' }
                },
                take: 20
            });

            res.json(messages);
        } catch (error) {
            console.error('[getInbox] Error:', error);
            res.status(500).json({ error: 'Error fetching inbox' });
        }
    }

    /**
     * Get messaging contacts based on the user's role in thesis projects.
     * - Students: see their director(s) from their thesis projects
     * - Directors/Professors: see their students from thesis projects + faculty coordinator(s)
     * - Coordinators: see directors in their faculty
     */
    public async getMessagingContacts(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            if (!user) {
                res.status(403).json({ error: 'No autorizado' });
                return;
            }

            // 1. Find all thesis projects where this user is an actor
            const myActorRecords = await prisma.actores.findMany({
                where: { id_persona: user.id_persona, estado: 'activo' },
                include: {
                    tipo_rol: { select: { nombre_rol: true } },
                    trabajo_grado: { select: { id_trabajo_grado: true } }
                }
            });

            // Determine the user's role(s)
            const roleNames = myActorRecords.map(a => a.tipo_rol.nombre_rol);
            const isStudent = roleNames.includes('Estudiante');
            const isDirector = roleNames.includes('Director');
            const isCoordinator = roleNames.includes('Coordinador de Carrera');

            const myProjectIds = myActorRecords.map(a => a.trabajo_grado.id_trabajo_grado);
            const contactIds = new Set<string>();

            // ── Students ──────────────────────────────────────────
            if (isStudent) {
                // See their Director(s) from their thesis projects
                if (myProjectIds.length > 0) {
                    const directors = await prisma.actores.findMany({
                        where: {
                            id_trabajo_grado: { in: myProjectIds },
                            tipo_rol: { nombre_rol: 'Director' },
                            id_persona: { not: user.id_persona },
                            estado: 'activo'
                        },
                        select: { id_persona: true }
                    });
                    directors.forEach(d => contactIds.add(d.id_persona));
                }
            }

            // ── Directors / Professors ────────────────────────────
            if (isDirector) {
                // See their Students from thesis projects
                if (myProjectIds.length > 0) {
                    const students = await prisma.actores.findMany({
                        where: {
                            id_trabajo_grado: { in: myProjectIds },
                            tipo_rol: { nombre_rol: 'Estudiante' },
                            id_persona: { not: user.id_persona },
                            estado: 'activo'
                        },
                        select: { id_persona: true }
                    });
                    students.forEach(s => contactIds.add(s.id_persona));
                }
            }

            // ── Students & Directors always see their faculty coordinator(s) ──
            if ((isStudent || isDirector || (!isCoordinator && myActorRecords.length === 0)) && user.id_facultad) {
                // Find coordinators that belong to the same faculty
                const facultyCoords = await prisma.persona.findMany({
                    where: {
                        id_facultad: user.id_facultad,
                        id_persona: { not: user.id_persona },
                        actores: {
                            some: {
                                tipo_rol: { nombre_rol: 'Coordinador de Carrera' },
                                estado: 'activo'
                            }
                        }
                    },
                    select: { id_persona: true }
                });
                facultyCoords.forEach(c => contactIds.add(c.id_persona));
            }

            // ── Coordinators ──────────────────────────────────────
            if (isCoordinator && user.id_facultad) {
                // See only directors and students from their OWN faculty
                const facultyActors = await prisma.actores.findMany({
                    where: {
                        tipo_rol: { nombre_rol: { in: ['Director', 'Estudiante'] } },
                        persona: { id_facultad: user.id_facultad },
                        estado: 'activo'
                    },
                    select: { id_persona: true }
                });
                facultyActors.forEach(a => contactIds.add(a.id_persona));
            }

            // Remove self
            contactIds.delete(user.id_persona);

            if (contactIds.size === 0) {
                res.json([]);
                return;
            }

            const contacts = await prisma.persona.findMany({
                where: { id_persona: { in: Array.from(contactIds) } },
                select: {
                    id_persona: true,
                    nombres: true,
                    apellidos: true,
                    correo_electronico: true
                }
            });

            res.json(contacts);
        } catch (error) {
            console.error('[getMessagingContacts] Error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    /**
     * Get direct messaging conversation history with a specific user
     */
    public async getConversation(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const peerId = req.params.userId;

            if (!user || !peerId) {
                res.status(400).json({ error: 'Faltan parámetros de usuario' });
                return;
            }

            // Fetch all messages where I am the sender and they are the recipient
            // AND where they are the sender and I am the recipient
            const deliveries = await (prisma as any).mensaje_entrega.findMany({
                where: {
                    OR: [
                        {
                            id_receptor: user.id_persona,
                            mensaje: { id_emisor: peerId }
                        },
                        {
                            id_receptor: peerId,
                            mensaje: { id_emisor: user.id_persona }
                        }
                    ]
                },
                include: {
                    mensaje: {
                        select: {
                            id_emisor: true,
                            contenido: true,
                            fecha_envio: true
                        }
                    }
                },
                orderBy: {
                    mensaje: {
                        fecha_envio: 'asc'
                    }
                }
            });

            res.json(deliveries.map(d => ({
                id_entrega: d.id_entrega,
                id_mensaje: d.id_mensaje,
                contenido: d.mensaje.contenido,
                id_emisor: d.mensaje.id_emisor,
                estado: d.estado,
                fecha: d.mensaje.fecha_envio,
                soy_emisor: d.mensaje.id_emisor === user.id_persona
            })));
        } catch (error) {
            console.error('[getConversation] Error:', error);
            res.status(500).json({ error: 'Server error fetching conversation' });
        }
    }

    /**
     * Get recent conversations grouped by person.
     * Returns a list of unique conversation partners with the last message preview.
     */
    public async getRecentConversations(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            if (!user) {
                res.status(401).json({ error: 'No autorizado' });
                return;
            }

            // Get all deliveries where this user is involved
            const allDeliveries: any[] = await (prisma as any).mensaje_entrega.findMany({
                where: {
                    OR: [
                        { id_receptor: user.id_persona },
                        { mensaje: { id_emisor: user.id_persona } }
                    ]
                },
                include: {
                    mensaje: {
                        select: {
                            id_emisor: true,
                            contenido: true,
                            fecha_envio: true,
                            emisor: {
                                select: {
                                    id_persona: true,
                                    nombres: true,
                                    apellidos: true,
                                    correo_electronico: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    mensaje: { fecha_envio: 'desc' }
                }
            });

            // Group by the OTHER person in the conversation
            const conversationMap = new Map<string, any>();

            for (const d of allDeliveries) {
                const isSender = d.mensaje.id_emisor === user.id_persona;
                const otherPersonId = isSender ? d.id_receptor : d.mensaje.id_emisor;

                // Skip self-deliveries (where I am both sender and receptor)
                if (otherPersonId === user.id_persona) continue;

                if (!conversationMap.has(otherPersonId)) {
                    // Fetch the other person's info if not the emisor
                    let otherPerson;
                    if (!isSender) {
                        otherPerson = d.mensaje.emisor;
                    } else {
                        // We need to look up the receptor
                        otherPerson = await prisma.persona.findUnique({
                            where: { id_persona: otherPersonId },
                            select: { id_persona: true, nombres: true, apellidos: true, correo_electronico: true }
                        });
                    }

                    conversationMap.set(otherPersonId, {
                        peerId: otherPersonId,
                        peerName: otherPerson ? `${otherPerson.nombres} ${otherPerson.apellidos}` : 'Desconocido',
                        peerEmail: otherPerson?.correo_electronico || '',
                        peerInitials: otherPerson ? `${otherPerson.nombres.charAt(0)}${otherPerson.apellidos.charAt(0)}` : '??',
                        lastMessage: d.mensaje.contenido,
                        lastMessageDate: d.mensaje.fecha_envio,
                        lastMessageIsMine: isSender,
                        unreadCount: (!isSender && d.estado === 'PENDING') ? 1 : 0
                    });
                } else {
                    // Increment unread count if applicable
                    if (!isSender && d.estado === 'PENDING') {
                        conversationMap.get(otherPersonId)!.unreadCount += 1;
                    }
                }
            }

            res.json(Array.from(conversationMap.values()));
        } catch (error) {
            console.error('[getRecentConversations] Error:', error);
            res.status(500).json({ error: 'Error fetching conversations' });
        }
    }
}

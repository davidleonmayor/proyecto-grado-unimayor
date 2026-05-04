import { Request, Response } from "express";
import { WebhookService } from "./webhook.service";
import { logger, prisma } from "../config";

const webhookService = new WebhookService();

export class MessagingController {
  constructor() {
    this.sendMessage = this.sendMessage.bind(this);
    this.consumeWebhook = this.consumeWebhook.bind(this);
    this.getInbox = this.getInbox.bind(this);
    this.getMessagingContacts = this.getMessagingContacts.bind(this);
    this.getConversation = this.getConversation.bind(this);
    this.getRecentConversations = this.getRecentConversations.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.markConversationRead = this.markConversationRead.bind(this);
  }

  /**
   * Endpoint to send a new message.
   * We will create a `mensaje` record and dispatch a MESSAGE_CREATED webhook.
   * 
   * Data validation: handled by SendMessageSchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { id_persona: senderId, id_facultad: senderFacultyId } = req.user!;
      
      // req.body.content is guaranteed to exist - schema validated it
      const { content, targetRole, targetUserId } = req.body;

      // 1. Create the base Message Record
      const newMsg = await prisma.mensaje.create({
        data: {
          contenido: content,
          id_emisor: senderId,
          target_rol: targetRole || null,
        },
      });

      // 2. For DIRECT messages (1-on-1), create delivery records inline
      if (targetUserId) {
        // Verify target user exists
        const targetUser = await prisma.persona.findUnique({
          where: { id_persona: targetUserId },
        });
        if (!targetUser) {
          res.status(404).json({ error: "El destinatario no existe." });
          return;
        }

        // Create delivery for the RECIPIENT
        await prisma.mensaje_entrega.create({
          data: {
            id_mensaje: newMsg.id_mensaje,
            id_receptor: targetUserId,
            estado: "PENDING",
          },
        });

        // Create delivery for the SENDER (so they see their own sent message in conversation)
        await prisma.mensaje_entrega.create({
          data: {
            id_mensaje: newMsg.id_mensaje,
            id_receptor: senderId,
            estado: "READ", // Sender has already "read" their own message
          },
        });

        logger.info(
          `[sendMessage] Direct message delivered: ${senderId} -> ${targetUserId}`,
        );
      } else {
        // 3. For BROADCAST messages, use the webhook pipeline
        const webhookPayload = {
          event: "MESSAGE_CREATED",
          data: {
            messageId: newMsg.id_mensaje,
            content: newMsg.contenido,
            senderId: senderId,
            senderFacultyId: senderFacultyId,
            targetRole: targetRole,
          },
        };
        webhookService
          .dispatch("MESSAGE_CREATED", webhookPayload)
          .catch((e) => logger.error("Webhook Dispatch Error", e));
      }

      res.status(201).json({
        message: "Mensaje enviado exitosamente",
        data: newMsg,
      });
    } catch (error) {
      logger.error("[sendMessage] Error:", error);
      res.status(500).json({ error: "Error del servidor al enviar mensaje" });
    }
  }

  /**
   * Internal Webhook Consumer Endpoint
   * Listens for `MESSAGE_CREATED` payloads and creates individual Inbox Deliveries
   * (mensaje_entrega) enforcing Faculty constraints (`id_facultad`).
   * 
   * Secret validation: handled by ConsumeWebhookSchema (custom validator)
   * Event validation: handled by ConsumeWebhookSchema (matches /^MESSAGE_CREATED$/)
   * Data validation: handled by ConsumeWebhookSchema (exists, isObject)
   */
  public async consumeWebhook(req: Request, res: Response): Promise<void> {
    try {
      // req.body.event is guaranteed to be "MESSAGE_CREATED" - schema validated it
      // req.body.data is guaranteed to exist and be an object - schema validated it
      const { messageId, senderFacultyId, targetRole, targetUserId } = req.body.data;

      // Rule: Find all target users in the EXACT same faculty.
      const userFilters: any = {
        id_facultad: senderFacultyId,
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
        select: { id_persona: true },
      });

      // Create Deliveries recursively
      const deliveries = recipients.map((user) => ({
        id_mensaje: messageId,
        id_receptor: user.id_persona,
        estado: "PENDING",
      }));

      if (deliveries.length > 0) {
        await (prisma as any).mensaje_entrega.createMany({
          data: deliveries,
          skipDuplicates: true,
        });
        logger.info(
          `[Webhook Consume] Created ${deliveries.length} inbox deliveries for Message ${messageId} in Faculty ${senderFacultyId}`,
        );
      }

      res
        .status(200)
        .json({ status: "Consumed", deliveredTo: deliveries.length });
    } catch (error) {
      logger.error("[consumeWebhook] Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error consuming webhook" });
    }
  }

  /**
   * Fetch the active user's inbox.
   * 
   * Data validation: handled by AuthOnlySchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async getInbox(req: Request, res: Response): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { id_persona: userId } = req.user!;

      const messages = await prisma.mensaje_entrega.findMany({
        where: { id_receptor: userId },
        include: {
          mensaje: {
            include: {
              emisor: {
                select: {
                  nombres: true,
                  apellidos: true,
                  correo_electronico: true,
                },
              },
            },
          },
        },
        orderBy: {
          mensaje: { fecha_envio: "desc" },
        },
        take: 20,
      });

      res.json(messages);
    } catch (error) {
      logger.error("[getInbox] Error:", error);
      res.status(500).json({ error: "Error fetching inbox" });
    }
  }

  /**
   * Get messaging contacts based on the user's role in thesis projects.
   * - Students: see their director(s) from their thesis projects
   * - Directors/Professors: see their students from thesis projects + faculty coordinator(s)
   * - Coordinators: see directors in their faculty
   * 
   * Data validation: handled by AuthOnlySchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async getMessagingContacts(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { id_persona: userId, id_facultad: userFacultyId } = req.user!;

      // 1. Find all thesis projects where this user is an actor
      const myActorRecords = await prisma.actores.findMany({
        where: { id_persona: userId, estado: "activo" },
        include: {
          tipo_rol: { select: { nombre_rol: true } },
          trabajo_grado: { select: { id_trabajo_grado: true } },
        },
      });

      // Determine the user's role(s)
      const roleNames = myActorRecords.map((a) => a.tipo_rol.nombre_rol);
      const isStudent = roleNames.includes("Estudiante");
      const isDirector = roleNames.includes("Director");
      const isCoordinator = roleNames.includes("Coordinador de Carrera");

      const myProjectIds = myActorRecords.map(
        (a) => a.trabajo_grado.id_trabajo_grado,
      );
      const contactIds = new Set<string>();

      // ── Students ──────────────────────────────────────────
      if (isStudent) {
        // See their Director(s) from their thesis projects
        if (myProjectIds.length > 0) {
          const directors = await prisma.actores.findMany({
            where: {
              id_trabajo_grado: { in: myProjectIds },
              tipo_rol: { nombre_rol: "Director" },
              id_persona: { not: userId },
              estado: "activo",
            },
            select: { id_persona: true },
          });
          directors.forEach((d) => contactIds.add(d.id_persona));
        }
      }

      // ── Directors / Professors ────────────────────────────
      if (isDirector) {
        // See their Students from thesis projects
        if (myProjectIds.length > 0) {
          const students = await prisma.actores.findMany({
            where: {
              id_trabajo_grado: { in: myProjectIds },
              tipo_rol: { nombre_rol: "Estudiante" },
              id_persona: { not: userId },
              estado: "activo",
            },
            select: { id_persona: true },
          });
          students.forEach((s) => contactIds.add(s.id_persona));
        }
      }

      // ── Students & Directors always see their faculty coordinator(s) ──
      if (
        (isStudent ||
          isDirector ||
          (!isCoordinator && myActorRecords.length === 0)) &&
        userFacultyId
      ) {
        // Find coordinators that belong to the same faculty
        const facultyCoords = await prisma.persona.findMany({
          where: {
            id_facultad: userFacultyId,
            id_persona: { not: userId },
            actores: {
              some: {
                tipo_rol: { nombre_rol: "Coordinador de Carrera" },
                estado: "activo",
              },
            },
          },
          select: { id_persona: true },
        });
        facultyCoords.forEach((c) => contactIds.add(c.id_persona));
      }

      // ── Coordinators ──────────────────────────────────────
      if (isCoordinator && userFacultyId) {
        // See only directors and students from their OWN faculty
        const facultyActors = await prisma.actores.findMany({
          where: {
            tipo_rol: { nombre_rol: { in: ["Director", "Estudiante"] } },
            persona: { id_facultad: userFacultyId },
            estado: "activo",
          },
          select: { id_persona: true },
        });
        facultyActors.forEach((a) => contactIds.add(a.id_persona));
      }

      // Remove self
      contactIds.delete(userId);

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
          correo_electronico: true,
        },
      });

      res.json(contacts);
    } catch (error) {
      logger.error("[getMessagingContacts] Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get direct messaging conversation history with a specific user.
   * 
   * Data validation: handled by UserIdParamSchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async getConversation(req: Request, res: Response): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      // req.params.userId is guaranteed to exist - schema validated it
      const { id_persona: userId } = req.user!;
      const peerId = req.params.userId;

      // Fetch all messages where I am the sender and they are the recipient
      // AND where they are the sender and I am the recipient
      const deliveries = await prisma.mensaje_entrega.findMany({
        where: {
          OR: [
            {
              id_receptor: userId,
              mensaje: { id_emisor: peerId },
            },
            {
              id_receptor: peerId,
              mensaje: { id_emisor: userId },
            },
          ],
        },
        include: {
          mensaje: {
            select: {
              id_emisor: true,
              contenido: true,
              fecha_envio: true,
            },
          },
        },
        orderBy: {
          mensaje: {
            fecha_envio: "asc",
          },
        },
      });

      res.json(
        deliveries.map((d) => ({
          id_entrega: d.id_entrega,
          id_mensaje: d.id_mensaje,
          contenido: d.mensaje.contenido,
          id_emisor: d.mensaje.id_emisor,
          estado: d.estado,
          fecha: d.mensaje.fecha_envio,
          soy_emisor: d.mensaje.id_emisor === userId,
        })),
      );
    } catch (error) {
      logger.error("[getConversation] Error:", error);
      res.status(500).json({ error: "Server error fetching conversation" });
    }
  }

  /**
   * Get recent conversations grouped by person.
   * Returns a list of unique conversation partners with the last message preview.
   * 
   * Data validation: handled by AuthOnlySchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async getRecentConversations(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { id_persona: userId } = req.user!;

      // Get all deliveries where this user is involved
      const allDeliveries = await prisma.mensaje_entrega.findMany({
        where: {
          OR: [
            { id_receptor: userId },
            { mensaje: { id_emisor: userId } },
          ],
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
                  correo_electronico: true,
                },
              },
            },
          },
        },
        orderBy: {
          mensaje: { fecha_envio: "desc" },
        },
      });

      // Group by the OTHER person in the conversation
      interface ConversationPreview {
        peerId: string;
        peerName: string;
        peerEmail: string;
        peerInitials: string;
        lastMessage: string;
        lastMessageDate: Date;
        lastMessageIsMine: boolean;
        unreadCount: number;
      }

      const conversationMap = new Map<string, ConversationPreview>();

      for (const d of allDeliveries) {
        const isSender = d.mensaje.id_emisor === userId;
        const otherPersonId = isSender ? d.id_receptor : d.mensaje.id_emisor;

        // Skip self-deliveries (where I am both sender and receptor)
        if (otherPersonId === userId) continue;

        if (!conversationMap.has(otherPersonId)) {
          // Fetch the other person's info if not the emisor
          let otherPerson;
          if (!isSender) {
            otherPerson = d.mensaje.emisor;
          } else {
            // We need to look up the receptor
            otherPerson = await prisma.persona.findUnique({
              where: { id_persona: otherPersonId },
              select: {
                id_persona: true,
                nombres: true,
                apellidos: true,
                correo_electronico: true,
              },
            });
          }

          conversationMap.set(otherPersonId, {
            peerId: otherPersonId,
            peerName: otherPerson
              ? `${otherPerson.nombres} ${otherPerson.apellidos}`
              : "Desconocido",
            peerEmail: otherPerson?.correo_electronico || "",
            peerInitials: otherPerson
              ? `${otherPerson.nombres.charAt(0)}${otherPerson.apellidos.charAt(0)}`
              : "??",
            lastMessage: d.mensaje.contenido,
            lastMessageDate: d.mensaje.fecha_envio,
            lastMessageIsMine: isSender,
            unreadCount: !isSender && d.estado === "PENDING" ? 1 : 0,
          });
        } else {
          // Increment unread count if applicable
          if (!isSender && d.estado === "PENDING") {
            conversationMap.get(otherPersonId)!.unreadCount += 1;
          }
        }
      }

      res.json(Array.from(conversationMap.values()));
    } catch (error) {
      logger.error("[getRecentConversations] Error:", error);
      res.status(500).json({ error: "Error fetching conversations" });
    }
  }

  /**
   * Lightweight endpoint: returns only the total unread message count.
   * Used by the Navbar for efficient polling.
   * 
   * Data validation: handled by AuthOnlySchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { id_persona: userId } = req.user!;

      const count = await prisma.mensaje_entrega.count({
        where: {
          id_receptor: userId,
          estado: "PENDING",
          mensaje: {
            id_emisor: { not: userId },
          },
        },
      });

      res.json({ unreadCount: count });
    } catch (error) {
      logger.error("[getUnreadCount] Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Mark all messages from a specific peer as READ.
   * Called when the user opens a conversation.
   * 
   * Data validation: handled by UserIdParamSchema (express-validator)
   * Auth validation: handled by AuthMiddleware (isAuthenticatedUser, isConfirmed)
   */
  public async markConversationRead(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      // req.params.userId is guaranteed to exist - schema validated it
      const { id_persona: userId } = req.user!;
      const peerId = req.params.userId;

      // Update all PENDING deliveries where I am the recipient and the peer is the sender
      const result = await prisma.mensaje_entrega.updateMany({
        where: {
          id_receptor: userId,
          estado: "PENDING",
          mensaje: {
            id_emisor: peerId,
          },
        },
        data: {
          estado: "READ",
          fecha_lectura: new Date(),
        },
      });

      res.json({ markedRead: result.count });
    } catch (error) {
      logger.error("[markConversationRead] Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

import { Router } from "express";
import { MessagingController } from "./messaging.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";

export class MessagingRoutes {
    public router: Router = Router();
    private messagingController: MessagingController;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.messagingController = new MessagingController();
        this.authMiddleware = new AuthMiddleware();
    }

    public initRoutes() {
        // External trigger path (requires authentication)
        this.router.post("/send", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.sendMessage.bind(this.messagingController));

        // Inbox retrieval path (requires authentication)
        this.router.get("/inbox", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.getInbox.bind(this.messagingController));

        // Get messaging contacts (role-based)
        this.router.get("/users", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.getMessagingContacts.bind(this.messagingController));

        // Get direct conversation
        this.router.get("/conversation/:userId", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.getConversation.bind(this.messagingController));

        // Get recent conversations grouped by person
        this.router.get("/conversations", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.getRecentConversations.bind(this.messagingController));

        // Get unread message count (lightweight, for polling)
        this.router.get("/unread-count", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.getUnreadCount.bind(this.messagingController));

        // Mark conversation as read
        this.router.put("/conversation/:userId/read", this.authMiddleware.isAuthenticatedUser.bind(this.authMiddleware), this.messagingController.markConversationRead.bind(this.messagingController));

        // Internal Webhook Consumer path (does NOT require user auth, requires secret validation)
        this.router.post("/webhook/consume", this.messagingController.consumeWebhook.bind(this.messagingController));
    }
}

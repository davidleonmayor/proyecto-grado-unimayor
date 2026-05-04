import { Router } from "express";
import { MessagingController } from "./messaging.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  AuthOnlySchema,
  ConsumeWebhookSchema,
  SendMessageSchema,
  UserIdParamSchema,
} from "./messaging.schema";

export class MessagingRoutes {
  public router: Router;
  private messagingController: MessagingController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.messagingController = new MessagingController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    // External trigger path (requires authentication)
    this.router.post(
      "/send",
      validateSchema(SendMessageSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.sendMessage,
    );

    // Inbox retrieval path (requires authentication)
    this.router.get(
      "/inbox",
      validateSchema(AuthOnlySchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.getInbox,
    );

    // Get messaging contacts (role-based)
    this.router.get(
      "/users",
      validateSchema(AuthOnlySchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.getMessagingContacts,
    );

    // Get direct conversation
    this.router.get(
      "/conversation/:userId",
      validateSchema(UserIdParamSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.getConversation,
    );

    // Get recent conversations grouped by person
    this.router.get(
      "/conversations",
      validateSchema(AuthOnlySchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.getRecentConversations,
    );

    // Get unread message count (lightweight, for polling)
    this.router.get(
      "/unread-count",
      validateSchema(AuthOnlySchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.getUnreadCount,
    );

    // Mark conversation as read
    this.router.put(
      "/conversation/:userId/read",
      validateSchema(UserIdParamSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.messagingController.markConversationRead,
    );

    // Internal Webhook Consumer path (does NOT require user auth, requires secret validation)
    this.router.post(
      "/webhook/consume",
      validateSchema(ConsumeWebhookSchema),
      this.messagingController.consumeWebhook,
    );
  }
}

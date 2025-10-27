import { PrismaClient } from "@prisma/client";
import { logger, envs } from "./index";

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log:
          envs.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });

      PrismaService.instance
        .$connect()
        .then(() => {
          logger.info("✅ Database connected successfully");
        })
        .catch((error) => {
          logger.error("❌ Database connection failed:", error);
        });
    }

    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      logger.info("🔌 Database disconnected");
    }
  }
}

export const prisma = PrismaService.getInstance();
export const disconnectPrisma = PrismaService.disconnect;

import type { Request, Response, NextFunction } from "express";
import type { Budget } from "@prisma/client";
import { prisma } from "../../config/prisma";

declare global {
  namespace Express {
    interface Request {
      budget?: Budget;
    }
  }
}

export class BudgetMiddleware {
  public async validateBudgetOwnership(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, params } = req;

      if (!user) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      // Buscar el presupuesto
      const budget = await prisma.budget.findUnique({
        where: { id: params.budgetId },
      });

      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }

      // Verificar propiedad - ✅ CORRECTO: usar userId
      if (budget.userId !== user.id) {
        res.status(403).json({
          error: "No tienes permiso para acceder a este presupuesto",
        });
        return;
      }

      // Adjuntar el presupuesto al request para evitar otra consulta
      req.budget = budget;

      next();
    } catch (error) {
      console.error("Error en validateBudgetOwnership:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  public async validateBudgetExists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { budgetId } = req.params;

    try {
      const budget = await prisma.budget.findUnique({
        where: { id: budgetId },
      });

      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }

      req.budget = budget;
      next();
    } catch (error) {
      next(error);
    }
  }
}

import type { Request, Response, NextFunction } from "express";
import type { Expense } from "@prisma/client";
import { prisma } from "../../config/prisma";

declare global {
  namespace Express {
    interface Request {
      expense?: Expense;
    }
  }
}

export class ExpenseMiddleware {
  public async validateExpenseExists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { expenseId } = req.params;

    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          budget: true,
        },
      });

      if (!expense) {
        res.status(404).json({ error: "Gasto no encontrado" });
        return;
      }

      req.expense = expense;
      next();
    } catch (error) {
      next(error);
    }
  }

  public async validateExpenseOwnership(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { user, params } = req;

    try {
      if (!user) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      // Buscar el gasto con su presupuesto asociado
      const expense = await prisma.expense.findUnique({
        where: { id: params.expenseId },
        include: {
          budget: true,
        },
      });

      if (!expense) {
        res.status(404).json({ error: "Gasto no encontrado" });
        return;
      }

      // Verificar que el presupuesto del gasto pertenece al usuario
      if (expense.budget.userId !== user.id) {
        res.status(403).json({
          error: "No tienes permiso para acceder a este gasto",
        });
        return;
      }

      // Adjuntar el gasto al request
      req.expense = expense;
      next();
    } catch (error) {
      console.error("Error en validateExpenseOwnership:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  public async validateExpenseBelongsToBudget(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { budgetId, expenseId } = req.params;

    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        res.status(404).json({ error: "Gasto no encontrado" });
        return;
      }

      // Verificar que el gasto pertenece al presupuesto especificado
      if (expense.budgetId !== budgetId) {
        res.status(400).json({
          error: "Este gasto no pertenece al presupuesto especificado",
        });
        return;
      }

      req.expense = expense;
      next();
    } catch (error) {
      next(error);
    }
  }
}

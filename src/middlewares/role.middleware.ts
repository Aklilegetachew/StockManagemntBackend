// src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/AppError"

export const roleGuard =
  (...allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user || !allowedRoles.includes(user.role)) {
      throw new AppError("Forbidden", 403)
    }

    next()
  }

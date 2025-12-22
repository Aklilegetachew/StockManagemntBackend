import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../errors/AppError"

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) throw new AppError("Unauthorized", 401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    ;(req as any).user = decoded
    next()
  } catch {
    throw new AppError("Invalid token", 401)
  }
}

import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/AppError"

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    })
  }

  console.error("Unhandle Error:", err)

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  })
}

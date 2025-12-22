import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { AppDataSource } from "./data-source"

import userRoutes from "./modules/users/user.routes"
import roleRoutes from "./modules/roles/role.routes"
import branchRoutes from "./modules/branches/branch.routes"
import productRoutes from "./modules/products/product.routes"

dotenv.config()

const app = express()
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
)
app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/products", productRoutes)


app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!")
})

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected ✔️")

    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Database connection error:", err)
    process.exit(1)
  })

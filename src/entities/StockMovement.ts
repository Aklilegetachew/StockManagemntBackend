// src/entities/StockMovement.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { Product } from "./Product"
import { Branch } from "./branches"

export enum StockMovementType {
  ADDITION = "ADDITION",
  DEDUCTION = "DEDUCTION",
}

@Entity({ name: "stock_movements" })
export class StockMovement {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Product, { eager: true })
  product!: Product

  @ManyToOne(() => Branch, { nullable: true, eager: true })
  branch?: Branch // null means central stock

  @Column({ type: "enum", enum: StockMovementType })
  type!: StockMovementType

  @Column({ type: "decimal", precision: 14, scale: 3 })
  quantity!: number

  @Column()
  reference!: string // request number, purchase ID, etc.

  @Column({ type: "text", nullable: true })
  note?: string

  @CreateDateColumn()
  createdAt!: Date
}

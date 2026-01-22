// src/entities/StockMovement.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm"
import { Product } from "./Product"
import { Branch } from "./branches"
import { User } from "./user"

export enum StockMovementType {
  ADDITION = "ADDITION", 
  DEDUCTION = "DEDUCTION", 
  SALE = "SALE", 
  TRANSFER_IN = "TRANSFER_IN", 
  TRANSFER_OUT = "TRANSFER_OUT", 
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

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  quantity!: number

  @Column()
  reference!: string // request number, purchase ID, etc.

  @Column({ type: "text", nullable: true })
  note?: string

  @ManyToOne(() => User, { nullable: true, eager: true })
  requestedBy?: User // user who initiated/requested the movement

  @ManyToOne(() => User, { nullable: true, eager: true })
  approvedBy?: User // user who approved/performed the action

  @CreateDateColumn()
  createdAt!: Date
}

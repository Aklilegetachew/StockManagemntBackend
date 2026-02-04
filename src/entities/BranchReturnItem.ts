import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm"
import { BranchReturn } from "./BranchReturn"
import { Product } from "./Product"

export enum ReturnReason {
  EXPIRY = "EXPIRY",
  DEFECT = "DEFECT",
  OTHER = "OTHER",
}

@Entity({ name: "branch_return_items" })
export class BranchReturnItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => BranchReturn, (return_) => return_.items)
  branchReturn!: BranchReturn

  @ManyToOne(() => Product, { eager: true })
  product!: Product

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  quantity!: number

  @Column({
    type: "enum",
    enum: ReturnReason,
  })
  reason!: ReturnReason

  @Column({ type: "text", nullable: true })
  note?: string | null

  @CreateDateColumn()
  createdAt!: Date
}

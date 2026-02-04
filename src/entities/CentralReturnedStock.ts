import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm"
import { Product } from "./Product"
import { Branch } from "./branches"
import { BranchReturn } from "./BranchReturn"

@Entity({ name: "central_returned_stocks" })
export class CentralReturnedStock {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Product, { eager: true })
  product!: Product

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  quantity!: number

  @Column({ type: "varchar", length: 50 })
  reason!: string

  @ManyToOne(() => Branch, { eager: true })
  sourceBranch!: Branch

  @ManyToOne(() => BranchReturn, { eager: true })
  branchReturn!: BranchReturn

  @CreateDateColumn()
  createdAt!: Date
}

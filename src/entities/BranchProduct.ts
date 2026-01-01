// src/entities/BranchProduct.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from "typeorm"
import { Branch } from "./branches"
import { Product } from "./Product"

@Entity({ name: "branch_products" })
@Unique(["branch", "product"])
@Check(`"quantity" >= 0`)
export class BranchProduct {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Branch, { eager: true, onDelete: "CASCADE" })
  branch!: Branch

  @ManyToOne(() => Product, { eager: true, onDelete: "RESTRICT" })
  product!: Product

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  quantity!: number

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  price!: number

  @Column({ default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

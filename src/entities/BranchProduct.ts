// src/entities/BranchProduct.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from "typeorm"
import { Branch } from "./branches"
import { Product } from "./Product"

@Entity({ name: "branch_products" })
@Unique(["branch", "product"])
export class BranchProduct {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Branch, { eager: true })
  branch!: Branch

  @ManyToOne(() => Product, { eager: true })
  product!: Product

  @Column({ default: true })
  isActive!: boolean
}

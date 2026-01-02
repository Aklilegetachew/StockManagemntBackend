// src/entities/Product.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { BranchProduct } from "./BranchProduct"
import { Category } from "./Category"

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  name!: string

  @Column({ unique: true })
  sku!: string // internal code (VERY useful)

  @Column({ nullable: true })
  description?: string

  @Column({ default: "unit" })
  unit!: string // kg, packet, box, etc.

  @Column({ default: true })
  isActive!: boolean

  @OneToMany(() => BranchProduct, (bp) => bp.product)
  branches!: BranchProduct[]

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  category?: Category

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

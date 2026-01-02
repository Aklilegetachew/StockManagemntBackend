// src/entities/Category.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Product } from "./Product"

@Entity({ name: "categories" })
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  name!: string

  @Column({ nullable: true })
  description?: string

  @Column({ default: true })
  isActive!: boolean

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

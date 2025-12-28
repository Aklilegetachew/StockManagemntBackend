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
import { Product } from "./Product"

@Entity({ name: "central_stocks" })
@Unique(["product"])
@Check(`"quantity" >= 0`)
export class CentralStock {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Product, { eager: true, onDelete: "RESTRICT" })
  product!: Product

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  quantity!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

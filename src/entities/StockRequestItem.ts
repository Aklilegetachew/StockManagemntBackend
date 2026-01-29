// src/entities/StockRequestItem.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm"
import { StockRequest } from "./StockRequest"
import { Product } from "./Product"

@Entity({ name: "stock_request_items" })
export class StockRequestItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => StockRequest, (request) => request.items)
  stockRequest!: StockRequest

  @ManyToOne(() => Product, { eager: true })
  product!: Product

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  requestedQuantity!: number

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  approvedQuantity!: number

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  receivedQuantity!: number

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  returnedQuantity!: number
}

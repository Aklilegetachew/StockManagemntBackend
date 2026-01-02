import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm"
import { SalesReport } from "./SalesReport"
import { Product } from "./Product"

@Entity({ name: "sales_report_items" })
@Unique(["salesReport", "product"])
export class SalesReportItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => SalesReport, (report) => report.items, {
    onDelete: "CASCADE",
  })
  salesReport!: SalesReport

  @ManyToOne(() => Product, { nullable: false })
  product!: Product

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantitySold!: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  unitPrice!: number

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  totalAmount!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

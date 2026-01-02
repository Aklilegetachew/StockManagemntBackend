import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Branch } from "./branches"
import { User } from "./user"

@Entity({ name: "sales_reports" })
export class SalesReport {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Branch, { nullable: false })
  branch!: Branch

  @Column({ type: "date" })
  startDate!: Date

  @Column({ type: "date" })
  endDate!: Date

  @ManyToOne(() => User, { nullable: false })
  uploadedBy!: User

  @Column()
  originalFileName!: string

  @OneToMany("SalesReportItem", "salesReport", {
    cascade: true,
  })
  items!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

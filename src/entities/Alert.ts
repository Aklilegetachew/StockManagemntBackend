import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Branch } from "./branches"
import { Product } from "./Product"
import { User } from "./user"

export enum AlertPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum AlertStatus {
  NEW = "NEW",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  RESOLVED = "RESOLVED",
}

export enum AlertType {
  LOW_STOCK = "LOW_STOCK",
  CRITICAL_STOCK = "CRITICAL_STOCK",
  LATE_ORDER = "LATE_ORDER",
}

@Entity({ name: "alerts" })
export class Alert {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({
    type: "enum",
    enum: AlertPriority,
    default: AlertPriority.MEDIUM,
  })
  priority!: AlertPriority

  @Column({
    type: "enum",
    enum: AlertStatus,
    default: AlertStatus.NEW,
  })
  status!: AlertStatus

  @Column({
    type: "enum",
    enum: AlertType,
  })
  type!: AlertType

  @Column()
  message!: string

  // Relations

  @Column({ nullable: true })
  branchId?: string

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: "branchId" })
  branch?: Branch

  @Column({ nullable: true })
  productId?: string

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: Product

  // Tracking who managed the alert

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "acknowledgedBy" })
  acknowledgedBy?: User

  @Column({ nullable: true })
  acknowledgedAt?: Date

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "resolvedBy" })
  resolvedBy?: User

  @Column({ nullable: true })
  resolvedAt?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Branch } from "./branches"
import { User } from "./user"
import { StockRequestItem } from "./StockRequestItem"

export enum StockRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DISPATCHED = "DISPATCHED",
  RECEIVED = "RECEIVED",
}

@Entity({ name: "stock_requests" })
export class StockRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Branch, { eager: true })
  branch!: Branch

  @ManyToOne(() => User, { eager: true })
  requestedBy!: User

  @OneToMany(() => StockRequestItem, (item) => item.stockRequest, {
    cascade: true,
    eager: true,
  })
  items!: StockRequestItem[]

  @Column({
    type: "enum",
    enum: StockRequestStatus,
    default: StockRequestStatus.PENDING,
  })
  status!: StockRequestStatus

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date

  @Column({ type: "timestamp", nullable: true })
  dispatchedAt?: Date

  @Column({ type: "timestamp", nullable: true })
  receivedAt?: Date

  @Column({ type: "timestamp", nullable: true })
  rejectedAt?: Date

  @Column({ type: "text", nullable: true })
  note?: string // optional note for partial approval or rejection

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

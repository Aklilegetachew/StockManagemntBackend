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
import { BranchReturnItem } from "./BranchReturnItem"

export enum BranchReturnStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity({ name: "branch_returns" })
export class BranchReturn {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Branch, { eager: true })
  branch!: Branch

  @ManyToOne(() => User, { eager: true })
  requestedBy!: User

  @OneToMany(() => BranchReturnItem, (item) => item.branchReturn, {
    cascade: true,
    eager: true,
  })
  items!: BranchReturnItem[]

  @Column({
    type: "enum",
    enum: BranchReturnStatus,
    default: BranchReturnStatus.PENDING,
  })
  status!: BranchReturnStatus

  @ManyToOne(() => User, { eager: true, nullable: true })
  approvedBy?: User | null

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date | null

  @Column({ type: "timestamp", nullable: true })
  rejectedAt?: Date | null

  @Column({ type: "text", nullable: true })
  rejectionNote?: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

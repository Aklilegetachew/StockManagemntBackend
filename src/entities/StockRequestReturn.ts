import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
  } from "typeorm"
  import { Branch } from "./branches"
  import { StockRequest } from "./StockRequest"
  import { StockRequestItem } from "./StockRequestItem"
  import { User } from "./user"
  
  @Entity({ name: "stock_returns" })
  export class StockRequestReturn {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @ManyToOne(() => StockRequest, { eager: true, onDelete: "CASCADE" })
    stockRequest!: StockRequest
  
    @ManyToOne(() => StockRequestItem, { eager: true, onDelete: "CASCADE" })
    stockRequestItem!: StockRequestItem
  
    @ManyToOne(() => Branch, { eager: true })
    branch!: Branch
  
    @Column({
      type: "decimal",
      precision: 12,
      scale: 2,
    })
    quantity!: number
  
    @Column({ type: "text" })
    reason!: string
  
    @ManyToOne(() => User, { eager: true, nullable: true })
    reportedBy?: User
  
    @CreateDateColumn({ type: "timestamp" })
    returnedAt!: Date
  }
  
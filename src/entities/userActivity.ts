import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm"
import { User } from "./user"
import { Branch } from "./branches"

@Entity({ name: "user_activity_logs" })
export class UserActivityLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => User, { eager: true })
  user!: User 

  @ManyToOne(() => Branch, { nullable: true, eager: true })
  branch?: Branch | null 

  @Column()
  action!: string 

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any> 

  @CreateDateColumn()
  createdAt!: Date
}

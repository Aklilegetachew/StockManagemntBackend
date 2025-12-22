import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Role } from "./role"
import { Branch } from "./branches"

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  fullName!: string

  @Column({ unique: true })
  email!: string

  @Column({ unique: true })
  username!: string

  @Column()
  passwordHash!: string

  @Column({ default: true })
  isActive!: boolean

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role!: Role

  @ManyToOne(() => Branch, (branch) => branch.users, {
    nullable: true,
    eager: true,
  })
  branch?: Branch | null

  @Column({ nullable: true })
  resetPasswordToken?: string

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

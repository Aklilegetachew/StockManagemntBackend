import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { User } from "./user"

@Entity({ name: "branches" })
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  name!: string

  @Column({ nullable: true })
  location?: string // optional

  @Column({ default: true })
  isActive!: boolean

  @OneToMany(() => User, (user) => user.branch)
  users!: User[]
}

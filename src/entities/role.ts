import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { User } from "./user"

export enum RoleCode {
  SUPER_ADMIN = "SUPER_ADMIN",
  CENTRAL_MANAGER = "CENTRAL_MANAGER",
  BRANCH_MANAGER = "BRANCH_MANAGER",
  SUPERVISOR = "SUPERVISOR",
}

@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  name!: string

  @Column({ type: "enum", enum: RoleCode, unique: true })
  code!: RoleCode

  @OneToMany(() => User, (user) => user.role)
  users!: User[]
}

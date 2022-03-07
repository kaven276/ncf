import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";
import { IUser } from 'src/interfaces/user';

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost"
}

export type FeTechType = "vue" | "react" | "angular"

/** 系统用户 */
@Entity({ name: 'user2' })
// 使用核心领域规范来确保 typeorm 实体符合规范
export class User implements IUser {

  /** 用户标识 */
  @PrimaryGeneratedColumn()

  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  /** 年龄 */
  @Column()
  age: number;

  @Column({ default: 'male', comment: 'user is male or female' })
  sex: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Column("simple-array", { nullable: true })
  names: string[];

  @Column({
    type: "enum",
    enum: ["react", "vue", "angular"],
    default: "react"
  })
  fetech: FeTechType;

  /** 喜好 */
  @Column("simple-array", { nullable: true })
  likes: string[];

}

import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, Index } from "typeorm";
import { IUser } from 'src/intf/user';
import { Org } from "./Org";

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
  /** 用户标识 */

  @PrimaryGeneratedColumn()
  id!: number;

  @Index('user_first_name', { unique: false })
  @Column()
  firstName!: string;


  @Index('user_last_name', { unique: false })
  @Column({ nullable: true })
  lastName!: string;

  @Column()
  age!: number;

  @Column({ default: 'male', comment: 'user is male or female' })
  sex!: string;

  @Index('user_role', { unique: false })
  @Column({ type: "enum", enum: UserRole, default: UserRole.ADMIN })
  role!: UserRole;

  @Column("simple-array", { nullable: true })
  names!: string[];

  @Column({
    type: "enum",
    enum: ["react", "vue", "angular"],
    default: "react"
  })
  fetech!: FeTechType;

  /** 喜好 */
  @Column("simple-array", { nullable: true })
  likes!: string[];

  /** 用户档案 */
  // @Index('user_nickname', { unique: false })
  @Column("simple-json", { nullable: true })
  profile!: {
    /** 用户真名 */
    name: string;
    /** 用户昵称 */
    nickname: string;
  };

  /** 用户所属组织(单个或者没有) */
  @ManyToOne(user => Org, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  org!: Org;

}

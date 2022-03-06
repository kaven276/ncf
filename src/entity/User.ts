import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost"
}
@Entity({ name: 'user2' })
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @Column({ default: 'male', comment: 'user is male or female' })
  sex: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Column("simple-array", { nullable: true })
  names: string[];

}

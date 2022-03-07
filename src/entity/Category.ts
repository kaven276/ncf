import { Entity, Tree, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, TreeLevelColumn } from "typeorm";

@Entity()
@Tree("closure-table")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @TreeChildren()
  children: Category;

  @TreeParent()
  parent: Category;

  @TreeLevelColumn()
  level: number;
}

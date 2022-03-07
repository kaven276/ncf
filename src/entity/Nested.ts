import { Entity, Tree, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, TreeLevelColumn } from "typeorm";

@Entity()
@Tree("nested-set")
export class Category2 {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @TreeChildren()
  children: Category2[];

  @TreeParent()
  parent: Category2;
}

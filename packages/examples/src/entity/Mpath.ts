import { Entity, Tree, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, TreeLevelColumn } from "typeorm";

@Entity()
@Tree("materialized-path")
export class Mpath {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @TreeChildren()
  children: Mpath[];

  @TreeParent()
  parent: Mpath;
}

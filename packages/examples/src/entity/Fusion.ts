import { Entity, TableInheritance, ChildEntity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Content {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

}


@ChildEntity()
export class Photo extends Content {

  @Column()
  size: string;

}

@ChildEntity()
export class Question extends Content {

  @Column()
  answersCount: number;

}

@ChildEntity()
export class Post extends Content {

  @Column()
  viewCount: number;
}

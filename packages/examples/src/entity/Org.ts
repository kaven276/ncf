import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: 'org2' })
export class Org {

  @PrimaryColumn({ type: 'cidr' })
  orgId;

  @Column({ type: 'int4' })
  rank: number;

  @Column()
  orgName: string;

  @Column("simple-array", {
    nullable: true,
  })
  tags: string[];

  @Column({
    array: true,
    nullable: true,
  })
  tagarr: string;

  @Column('jsonb', {
    nullable: false,
    default: {},
  })
  attrs;

  @Column({
    nullable: true,
    comment: '是否是官方正式组织机构',
  })
  formal: boolean;

}

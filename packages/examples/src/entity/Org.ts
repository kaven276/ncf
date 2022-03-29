import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { User } from './User';

@Entity({ name: 'org' })
export class Org {

  @PrimaryColumn({ type: 'varchar'})
  orgId!: string;

  @Column({ type: 'int4' })
  rank!: number;

  @Column()
  orgName!: string;

  @Column("simple-array", {
    nullable: true,
  })
  tags!: string[];

  @Column({
    array: true,
    nullable: true,
  })
  tagarr!: string;

  @Column('jsonb', {
    nullable: false,
    default: {},
  })
  attrs: any;

  @Column({
    nullable: true,
    comment: '是否是官方正式组织机构',
  })
  formal!: boolean;

  // RangeError: Maximum call stack size exceeded
  @OneToMany(org => User, user => user.org, {
    // deferrable: 'INITIALLY DEFERRED',
    nullable: true,
  })
  users!: User[];

}

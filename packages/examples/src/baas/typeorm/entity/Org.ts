import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { User } from './User';

/** 组织机构 */
@Entity({ name: 'org' })
export class Org {

  @PrimaryColumn({ type: 'varchar'})
  orgId!: string;

  @Column({ type: 'int4' })
  rank!: number;

  /** 组织名称 */
  @Column({ nullable: false, unique: true})
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

import { Entity, Property } from '@mikro-orm/core';

/** 客户表 */
@Entity()
export class Client {

  /** 客户ID */
  @Property({
    primary: true,
    autoincrement: true,
    comment: '客户标识'
  })
  id!: number;

  @Property({
    type: 'varchar',
    unique: true,
    length: 30,
    comment: '客户姓名',
    columnType: 'varchar',
  })
  title!: string;

}

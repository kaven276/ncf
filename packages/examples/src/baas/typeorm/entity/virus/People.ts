import { EntitySchema, Entity, Column, PrimaryColumn, ManyToMany, Relation, CreateDateColumn } from "typeorm";
import type { Person } from './types';
import { TestDose } from './TestDose';

@Entity({ name: 'person' })
export class People implements Person {
  @Column({
    type: 'char',
    length: 18,
    comment: '18位身份证ID'
  })
  @PrimaryColumn()
  id!: string;

  @Column('varchar', {
    length: 10,
    nullable: false,
    comment: '人员身份证姓名',
  })
  name!: string;

  @Column('char', {
    length: 11,
    nullable: false,
    comment: '用于联系的11位手机号码',
  })
  mobile!: string;

  @CreateDateColumn({
    type: "date",
    comment: '录入数据库时间',
  })
  regtime!: Date;

  // @ManyToMany(() => TestDose, (dose: TestDose) => dose.testees, {
  //   nullable: true,
  //   deferrable: "INITIALLY DEFERRED",
  // })
  // dose!: Relation<TestDose[]>;
}

//@ts-ignore
return;

const People1 = new EntitySchema<Person>({
  name: "person",
  columns: {
    id: {
      type: String,
      length: 18,
      primary: true,
      comment: '18位身份证ID',
    },
    name: {
      type: String,
      length: 10,
      nullable: false,
      comment: '人员姓名',
    },
    mobile: {
      type: String,
      length: 11,
      nullable: false,
      comment: '用于联系的11位手机号码'
    },
    regtime: {
      type: Date,
      createDate: true,
      comment: '录入数据库时间',
    },
  },
  relations: {
    dose: {
      inverseSide: 'test_dose',
      type: 'many-to-many',
      target: 'test_dose',
      nullable: true,
      cascade: false,
      // default: [],
      eager: false,
      lazy: false,
      onDelete: 'NO ACTION',
      onUpdate: 'RESTRICT',
      // joinTable: true,
    }
  },
  indices: [
    { name: 'people_id', columns: ['id'], unique: true },
    { columns: ['mobile'], unique: false },
    { columns: ['name'], unique: false },
  ],
  checks: [
  ],
});

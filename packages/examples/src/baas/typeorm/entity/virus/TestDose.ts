import { EntitySchema, Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from "typeorm";
import type { ITestDose } from './types';
import { People } from './People';

@Entity({ name: 'test_dose' })
export class TestDose implements ITestDose {
  @Column({
    type: 'char',
    length: 18,
    comment: '18位身份证ID'
  })
  @PrimaryColumn()
  serial!: string;

  @Column({
    type: "date",
    nullable: true,
    comment: '录入数据库时间',
  })
  use_time!: Date;

  @ManyToMany(() => People /*, (person: People) => person.dose */, {
    eager: true,
    lazy: false,
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  testees!: People[];
}

//@ts-ignore
return;

const TestDose1 = new EntitySchema<ITestDose>({
  name: "test_dose",
  columns: {
    serial: {
      generated: 'increment',
      type: String,
      length: 20,
      primary: true,
      comment: '20位试剂编号',
    },
    use_time: {
      type: Date,
      createDate: true,
      comment: '录入数据库时间',
    },
  },
  relations: {
    testees: {
      type: 'many-to-many',
      target: 'person',
      nullable: true,
      cascade: true,
      // default: [],
      eager: true,
      lazy: false,
      onDelete: 'NO ACTION',
      onUpdate: 'RESTRICT',
      joinTable: true,
    }
  },
  indices: [
  ],
  checks: [
  ],
});

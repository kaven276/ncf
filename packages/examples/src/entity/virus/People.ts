import { EntitySchema } from "typeorm";

interface Person {
  id: string,
  name: string,
  mobile: string,
  regtime: Date,
}

export const PeopleEntity = new EntitySchema<Person>({
  name: "person",
  columns: {
    /** 18位身份证ID */
    id: {
      type: String,
      length: 18,
      primary: true,
      comment: '18位身份证ID',
    },
    /** 人员姓名 */
    name: {
      type: String,
      length: 10,
      nullable: false,
      comment: '人员姓名',
    },
    /** 手机号 */
    mobile: {
      type: String,
      length: 11,
      nullable: false,
      comment: '用于联系的11位手机号码'
    },
    /** 录入时间 */
    regtime: {
      type: Date,
      createDate: true,
      comment: '录入数据库时间',
    },
  }
});

import { Entity, Column, PrimaryColumn, Index } from "typeorm";
import { IProduct } from 'src/intf/product';


/** 产品 */
@Entity()
// 使用核心领域规范来确保 typeorm 实体符合规范
export class Product implements IProduct {

  @PrimaryColumn()
  code!: string;

  @Index('product_name', { unique: false })
  @Column()
  name!: string;

  @Index('manufaturer_name', { unique: false })
  @Column()
  manufacturer: string;

  @Index('sale_name', { unique: false })
  @Column()
  saler: string;

  @Column()
  listPrice: number;

  @Index('product_category', { unique: false })
  @Column({ nullable: true })
  category?: string;

}

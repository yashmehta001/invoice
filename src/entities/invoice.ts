import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './users';
import { PaymentStatus, currency } from 'src/utils/user.dto';

@Entity({ name: 'Invoice' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seller_name: string;

  @Column({
    default: uuid(),
    unique: true,
  })
  invoice_name: string;

  @Column()
  seller_id: string;

  @Column()
  seller_email: string;

  @Column({
    default: new Date(),
  })
  billing_date: Date;

  @Column({
    nullable: true,
  })
  seller_address_1: string;

  @Column({
    nullable: true,
  })
  seller_address_2: string;

  @Column({
    nullable: true,
  })
  seller_address_3: string;

  @Column({
    nullable: true,
  })
  seller_mobile: string;

  @Column({
    nullable: true,
  })
  seller_gst: string;

  @Column({
    nullable: true,
  })
  logo: string;

  @Column()
  client_name: string;

  @Column()
  client_email: string;

  @Column({
    nullable: true,
  })
  client_address_1: string;

  @Column({
    nullable: true,
  })
  client_address_2: string;

  @Column({
    nullable: true,
  })
  client_address_3: string;

  @Column({
    nullable: true,
  })
  client_mobile: string;

  @Column({
    default: 0,
  })
  tax: number;

  @Column({
    default: 'INR',
  })
  currency: currency;

  @Column({
    default: 'outstanding',
  })
  status: PaymentStatus;

  @Column('json')
  order_items: Array<{ name: string; quantity: number; price: number }>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sub_total: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    default: new Date(),
  })
  created_at: Date;

  @Column({
    default: new Date(),
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}

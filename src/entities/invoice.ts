import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PaymentStatus, currency } from 'src/utils/user.dto';

@Entity({ name: 'Invoice' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  logo: string;

  @Column({
    default: uuid(),
  })
  invoice_name: string;

  @Column()
  from_id: string;

  @Column()
  from_name: string;

  @Column()
  from_email: string;

  @Column({
    nullable: true,
  })
  from_address: string;

  @Column({
    nullable: true,
  })
  from_mobile: string;

  @Column({
    nullable: true,
  })
  from_business_id: string;

  @Column()
  to_name: string;

  @Column()
  to_email: string;

  @Column({
    nullable: true,
  })
  to_address: string;

  @Column({
    nullable: true,
  })
  to_mobile: string;

  @Column({
    unique: true,
  })
  invoice_number: string;

  @Column({
    default: new Date(),
  })
  issue_date: Date;

  @Column('json')
  order_items: Array<{ name: string; quantity: number; price: number }>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax_rate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sub_total: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    default: 'INR',
  })
  currency: currency;

  @Column({
    default: 'outstanding',
  })
  status: PaymentStatus;

  @Column({
    default: new Date(),
  })
  created_at: Date;

  @Column({
    default: new Date(),
  })
  updated_at: Date;
}

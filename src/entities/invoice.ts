import { Currency, PaymentStatus } from 'src/utils/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  logo: string;

  @Column({
    default: uuid(),
    name: 'invoice_name',
  })
  invoiceName: string;

  @Column({
    name: 'from_id',
  })
  fromId: string;

  @Column({
    name: 'from_name',
  })
  fromName: string;

  @Column({
    name: 'from_email',
  })
  fromEmail: string;

  @Column({
    nullable: true,
    name: 'from_address',
  })
  fromAddress: string;

  @Column({
    nullable: true,
    name: 'from_mobile',
  })
  fromMobile: string;

  @Column({
    nullable: true,
    name: 'from_business_id',
  })
  fromBusinessId: string;

  @Column({
    name: 'to_name',
  })
  toName: string;

  @Column({
    name: 'to_email',
  })
  toEmail: string;

  @Column({
    nullable: true,
    name: 'to_address',
  })
  toAddress: string;

  @Column({
    nullable: true,
    name: 'to_mobile',
  })
  toMobile: string;

  @Column({
    unique: true,
    name: 'invoice_number',
  })
  invoiceNumber: string;

  @Column({
    default: new Date(),
    name: 'issue_date',
  })
  issueDate: Date;

  @Column({ type: 'json', name: 'order_items' })
  orderItems: Array<{ name: string; quantity: number; price: number }>;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  taxRate: number;

  @Column({
    name: 'sub_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subTotal: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    default: 'INR',
  })
  currency: Currency;

  @Column({
    default: 'outstanding',
  })
  status: PaymentStatus;

  @Column({
    default: new Date(),
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    default: new Date(),
    name: 'updated_at',
  })
  updatedAt: Date;
}

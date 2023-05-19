import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './invoice';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  is_verified: boolean;

  @Column({
    nullable: true,
  })
  code: number;

  @Column({
    nullable: true,
  })
  code_created_at: Date;

  @Column({
    default: new Date(),
  })
  created_at: Date;

  @Column({
    default: new Date(),
  })
  updated_at: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.seller_id)
  invoice: Invoice[];
}

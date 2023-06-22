import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  is_email_verified: boolean;

  @Column({
    nullable: true,
  })
  otp: number;

  @Column({
    nullable: true,
  })
  otp_created_at: Date;

  @CreateDateColumn({
    default: new Date(),
  })
  created_at: Date;

  @UpdateDateColumn({
    default: new Date(),
  })
  updated_at: Date;
}

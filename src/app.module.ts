import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './entities/users';
import { EmailModule } from './email/email.module';
import { database } from './config/config';
import { Invoice } from './entities/invoice';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: database.dbHost,
      port: database.dbPort,
      username: database.dbUsername,
      password: database.dbPassword,
      database: database.databaseName,
      entities: [User, Invoice],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    EmailModule,
    InvoiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

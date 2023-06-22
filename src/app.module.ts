import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './entities/users';
import { EmailModule } from './email/email.module';
import { config } from './utils/constants';
import { Invoice } from './entities/invoice';
import { InvoiceModule } from './invoice/invoice.module';
import { PdfModule } from './pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.dbHost,
      port: config.database.dbPort,
      username: config.database.dbUsername,
      password: config.database.dbPassword,
      database: config.database.databaseName,
      entities: [User, Invoice],
      synchronize: true,
      logging: true,
      logger: 'advanced-console',
    }),
    UsersModule,
    EmailModule,
    InvoiceModule,
    PdfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  database,
  dbHost,
  dbPassword,
  dbPort,
  dbUsername,
} from './utils/constants';
import { UsersModule } from './users/users.module';
import { User } from './entities/users';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: database,
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

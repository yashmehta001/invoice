import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  database,
  dbHost,
  dbPassword,
  dbPort,
  dbUsername,
} from './utils/constants';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: database,
      entities: [],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

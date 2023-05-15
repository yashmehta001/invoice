import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MiddlewareMiddleware } from 'src/middleware/middleware.middleware';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { EmailService } from 'src/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users';
import { Invoice } from 'src/entities/invoice';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invoice])],
  controllers: [InvoiceController],
  providers: [InvoiceService, EmailService, InvoiceService],
})
export class InvoiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareMiddleware).forRoutes(InvoiceController);
  }
}

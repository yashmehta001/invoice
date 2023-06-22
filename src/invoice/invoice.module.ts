import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { EmailService } from 'src/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users';
import { Invoice } from 'src/entities/invoice';
import { PdfService } from 'src/pdf/pdf.service';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from 'src/middleware/access-token.guard';
import { AuthenticationGuard } from 'src/middleware/authentication.guard';
import jwtConfig from 'src/users/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invoice]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [InvoiceController],
  providers: [
    EmailService,
    InvoiceService,
    PdfService,
    AccessTokenGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class InvoiceModule {}

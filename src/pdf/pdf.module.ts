import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [PdfService, EmailService],
})
export class PdfModule {}

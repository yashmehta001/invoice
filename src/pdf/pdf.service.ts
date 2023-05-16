import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { EmailService } from 'src/email/email.service';
import { emailInvoiceSubject, emailInvoiceText } from 'src/utils/constants';
import { createPdfParams } from 'src/utils/types';

@Injectable()
export class PdfService {
  constructor(private emailService: EmailService) {}

  async generatePdf(invoiceDetails: createPdfParams) {
    const seller_name = invoiceDetails.seller_name;
    const invoice_name = invoiceDetails.invoice_name;
    const seller_email = invoiceDetails.seller_email;
    const billing_date = invoiceDetails.billing_date;
    const seller_address_1 = invoiceDetails.seller_address_1;
    const seller_address_2 = invoiceDetails.seller_address_2;
    const seller_address_3 = invoiceDetails.seller_address_3;
    const seller_mobile = invoiceDetails.seller_mobile;
    const seller_gst = invoiceDetails.seller_gst;
    const logo = invoiceDetails.logo;
    const client_name = invoiceDetails.client_name;
    const client_email = invoiceDetails.client_email;
    const client_address_1 = invoiceDetails.client_address_1;
    const client_address_2 = invoiceDetails.client_address_2;
    const client_address_3 = invoiceDetails.client_address_3;
    const client_mobile = invoiceDetails.client_mobile;
    const order_items = invoiceDetails.order_items;
    const tax = invoiceDetails.tax;
    const currency = invoiceDetails.currency;
    const status = invoiceDetails.status;
    const sub_total = invoiceDetails.sub_total;
    const total = invoiceDetails.total;

    const fileName = invoiceDetails.invoice_name;
    const pdfFolder = path.join(__dirname, '..', '..', 'files', 'pdf');
    const filePath = path.join(pdfFolder, '/', fileName);
    const doc = new PDFDocument();

    doc
      .fontSize(12)
      .text(
        `seller name: ${seller_name}, invoice name: ${invoice_name}, seller email: ${seller_email}, billing date: ${billing_date}, seller address_1: ${seller_address_1}, seller address_2: ${seller_address_2}, seller address_3: ${seller_address_3}, seller mobile: ${seller_mobile}, seller gst: ${seller_gst}, logo: ${logo}, client name: ${client_name}, client email: ${client_email}, client address_1: ${client_address_1}, client address_2: ${client_address_2}, client address_3: ${client_address_3}, client mobile: ${client_mobile}, tax: ${tax}, currency: ${currency}, status: ${status}, sub total: ${sub_total}, total: ${total}`,
        100,
        100,
      );
    let orderPlacement = 250;
    order_items.forEach((items) => {
      doc
        .fontSize(12)
        .text(
          `Order: ${items.name}: ${items.price} * ${items.quantity}`,
          orderPlacement,
          orderPlacement,
        );
      orderPlacement += 10;
    });
    if (logo) {
      const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos');
      const logoPath = path.join(logoFolder, '/', logo);
      doc.image(`${logoPath}`, 320, 280, { scale: 0.25 });
    }

    doc.pipe(fs.createWriteStream(filePath));
    doc.end();
    const attachments = [
      {
        filename: fileName,
        content: fs.createReadStream(filePath),
      },
    ];
    await this.emailService.sendEmail(
      client_email,
      emailInvoiceSubject,
      emailInvoiceText,
      attachments,
    );
    return;
  }
}

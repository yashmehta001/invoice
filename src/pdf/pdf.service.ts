import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as ejs from 'ejs';
import { logoFolder, pdfFolder } from 'src/utils/constants';
import { createPdfParams } from 'src/utils/types';

@Injectable()
export class PdfService {
  async generatePdf(invoice: createPdfParams) {
    const pdfName = invoice.invoice_number + '.pdf';
    const pdfPath = path.join(pdfFolder, pdfName);

    invoice.invoice_number = invoice.invoice_number.split('_')[1];
    invoice.logo = logoFolder + invoice.logo;
    const templatePath = 'src/pdf/pdf.ejs';

    const html = await ejs.renderFile(templatePath, { invoice });
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf();
    await fs.promises.writeFile(pdfPath, pdfBuffer);
    await browser.close();
    return pdfPath;
  }
}

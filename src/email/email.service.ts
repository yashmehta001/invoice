import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../utils/constants';
import { attachmentParams } from 'src/utils/types';

@Injectable({})
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.mailConfig.emailService,
      auth: {
        user: config.mailConfig.email,
        pass: config.mailConfig.password,
      },
    });
  }
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments: attachmentParams[] | null,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: config.mailConfig.email,
        to,
        subject,
        text,
        attachments,
      });

      console.log('Email sent ' + info.response);
    } catch (e) {
      return e;
    }
  }
}

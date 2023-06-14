import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { mailConfig } from '../config/config';
import { attachmentParams } from 'src/utils/types';

@Injectable({})
export class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments: attachmentParams[] | null,
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: mailConfig.emailService,
        auth: {
          user: mailConfig.email,
          pass: mailConfig.password,
        },
      });
      const emailPayload = {
        from: mailConfig.email,
        to,
        subject,
        text,
        attachments: attachments,
      };
      const info = await transporter.sendMail(emailPayload);

      console.log('Email sent ' + info.response);
    } catch (e) {
      return e;
    }
  }
}

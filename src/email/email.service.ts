import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { email } from '../config/config';
import { attachmentParams } from 'src/utils/types';

@Injectable({})
export class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments: attachmentParams[] | null,
  ): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        service: email.emailService,
        auth: {
          user: email.email,
          pass: email.password,
        },
      });
      await transporter.sendMail(
        {
          from: email.email,
          to,
          subject,
          text,
          attachments: attachments,
        },
        function (err: any, info: { response: string }) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('Email sent ' + info.response);
          return;
        },
      );
    } catch (e) {
      return e;
    }
  }
}

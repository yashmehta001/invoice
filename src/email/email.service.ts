import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { email, emailService, password } from 'src/utils/constants';

@Injectable({})
export class EmailService {
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: email,
        pass: password,
      },
    });
    await transporter.sendMail(
      {
        from: email,
        to,
        subject,
        text,
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
  }
}

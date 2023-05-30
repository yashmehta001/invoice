import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users';
import {
  CreateUserParams,
  UserLoginParams,
  resendEmailParams,
  verifyUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';

import {
  errorMessage,
  responseMessage,
  createUserSubject,
  createUserText,
} from 'src/utils/constants';
import { userConstants } from 'src/config/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async createUser(createUserDetails: CreateUserParams) {
    try {
      const email = createUserDetails.email.toLowerCase();
      const user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        return errorMessage.emailExists;
      }
      const now = new Date();
      const password = await bcrypt.hash(
        createUserDetails.password,
        userConstants.saltRounds,
      );
      const otp = Math.floor(Math.random() * 900000) + 100000;

      const newUser = this.userRepository.create({
        first_name: createUserDetails.firstName,
        last_name: createUserDetails.lastName,
        email: email,
        password: password,
        is_email_verified: false,
        otp: otp,
        otp_created_at: now,
        created_at: now,
        updated_at: now,
      });

      await this.userRepository.save(newUser);
      await this.emailService.sendEmail(
        email,
        createUserSubject,
        createUserText + otp,
        null,
      );
      return responseMessage.userCreation;
    } catch (e) {
      return e;
    }
  }

  async loginUser(userLoginDetails: UserLoginParams) {
    try {
      const email = userLoginDetails.email.toLowerCase();

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return errorMessage.login;
      }
      const verifyPassword = await bcrypt.compare(
        userLoginDetails.password,
        user.password,
      );
      if (!verifyPassword) {
        return errorMessage.login;
      }
      if (!user.is_email_verified) {
        this.resendEmail({ email });
        return errorMessage.emailNotVerified;
      }
      const payload = { id: user.id };
      const accessToken = jwt.sign(payload, userConstants.jwtSecret);
      return { ...responseMessage.userLogin, accessToken };
    } catch (e) {
      return e;
    }
  }

  async verifyUser(userVerificationDetails: verifyUserParams) {
    try {
      const email = userVerificationDetails.email.toLowerCase();
      const now = new Date().getTime();
      const user = await this.userRepository.findOne({ where: { email } });
      const otpCreatedAt = new Date(user.otp_created_at);
      const id = user.id;

      if (!user) {
        return errorMessage.emailNotFound;
      }

      if (user.is_email_verified) {
        return errorMessage.isVerified;
      }

      if (+userVerificationDetails.otp != user.otp) {
        return errorMessage.isNotVerified;
      }

      if (+now > +otpCreatedAt + userConstants.otpExpiryTime) {
        this.resendEmail({ email });
        return errorMessage.otpExpired;
      }

      user.is_email_verified = true;
      user.otp = null;
      user.otp_created_at = null;

      await this.userRepository.update({ id }, { ...user });
      return responseMessage.userVerification;
    } catch (e) {
      return e;
    }
  }

  async resendEmail(resendEmailDetails: resendEmailParams) {
    try {
      const email = resendEmailDetails.email.toLowerCase();
      const otp = Math.floor(Math.random() * 900000) + 100000;
      const user = await this.userRepository.findOne({ where: { email } });
      const id = user.id;

      if (!user) {
        return errorMessage.emailNotFound;
      }

      if (user.is_email_verified) {
        return errorMessage.isVerified;
      }

      await this.emailService.sendEmail(
        email,
        createUserSubject,
        createUserText + otp,
        null,
      );

      user.otp = null;
      user.otp_created_at = new Date();
      user.otp = otp;

      await this.userRepository.update({ id }, { ...user });
      return responseMessage.resendEmail;
    } catch (e) {
      return e;
    }
  }
}

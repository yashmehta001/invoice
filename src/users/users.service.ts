import { compareSync, hashSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users';
import {
  CreateUserParams,
  UserLoginParams,
  getInvoiceParams,
  resendEmailParams,
  verifyUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';

import {
  errorMessage,
  responseMessage,
  createUserText,
} from 'src/utils/constants';
import { userConstants } from 'src/config/config';
import { mapper } from 'src/utils/mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(payload: CreateUserParams) {
    const { email, firstName, lastName, password } = payload;
    const emailLower = email.toLowerCase();
    try {
      await this.userRepository.findOneOrFail({
        where: { email: emailLower },
      });
      return errorMessage.emailExists;
    } catch (e) {
      const otp = mapper.generateOTP();
      const currentDate = new Date();

      try {
        const hashedPassword = hashSync(password, userConstants.saltRounds);

        const newUser = this.userRepository.create({
          firstName: firstName,
          lastName: lastName,
          email: emailLower,
          password: hashedPassword,
          is_email_verified: false,
          otp: otp,
          otp_created_at: currentDate,
          created_at: currentDate,
          updated_at: currentDate,
        });

        await this.userRepository.save(newUser);
        const text = `${createUserText} ${otp}`;
        return {
          isError: false,
          message: text,
        };
      } catch (e) {
        return errorMessage.dbError;
      }
    }
  }

  async resendEmail(payload: resendEmailParams) {
    try {
      const email = payload.email;
      const otp = mapper.generateOTP();
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });
      if (user.is_email_verified) return errorMessage.isVerified;
      await this.userRepository.update(
        { id: user.id },
        { otp: otp, otp_created_at: new Date() },
      );
      const text = `${createUserText} ${otp}`;
      return {
        isError: false,
        message: text,
      };
    } catch (e) {
      return errorMessage.emailNotFound;
    }
  }

  async getUserProfile(payload: getInvoiceParams) {
    try {
      const id = payload.toString();
      const user = await this.userRepository.findOneOrFail({
        select: ['firstName', 'lastName', 'email'],
        where: { id },
      });

      return { ...responseMessage.getUser, data: user };
    } catch (e) {
      return errorMessage.UserNotFound;
    }
  }

  async verifyUser(payload: verifyUserParams) {
    try {
      const { email, otp } = payload;
      const now = new Date().getTime();
      try {
        const user = await this.userRepository.findOneOrFail({
          where: { email },
        });
        const otpCreatedAt = new Date(user.otp_created_at);
        if (user.is_email_verified) return errorMessage.isVerified;
        if (now > otpCreatedAt.getTime() + userConstants.otpExpiryTime) {
          this.resendEmail({ email });
          return errorMessage.otpExpired;
        }
        if (+otp != user.otp) return errorMessage.isNotVerified;
        await this.userRepository.update(
          { id: user.id },
          { is_email_verified: true, otp: null, otp_created_at: null },
        );
        return responseMessage.userVerification;
      } catch (e) {
        return errorMessage.emailNotFound;
      }
    } catch (e) {
      return e;
    }
  }

  async loginUser(payload: UserLoginParams) {
    const { email, password } = payload;
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });

      const verifyPassword = compareSync(password, user.password);
      if (!verifyPassword) return errorMessage.login;
      if (!user.is_email_verified) {
        this.resendEmail({ email });
        return errorMessage.emailNotVerified;
      }
      const userId = { id: user.id };
      const accessToken = jwt.sign(userId, userConstants.jwtSecret);
      return { ...responseMessage.userLogin, data: { accessToken } };
    } catch (e) {
      return errorMessage.login;
    }
  }
}

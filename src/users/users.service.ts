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
      const code = Math.floor(Math.random() * 900000) + 100000;

      const newUser = this.userRepository.create({
        first_name: createUserDetails.firstName,
        last_name: createUserDetails.lastName,
        email: email,
        password: password,
        is_verified: false,
        code: code,
        code_created_at: now,
        created_at: now,
        updated_at: now,
      });

      await this.userRepository.save(newUser);
      await this.emailService.sendEmail(
        email,
        createUserSubject,
        createUserText + code,
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
      if (!user.is_verified) {
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
      const codeCreatedAt = new Date(user.code_created_at);
      const id = user.id;

      if (!user) {
        return errorMessage.emailNotFound;
      }

      if (user.is_verified) {
        return errorMessage.isVerified;
      }

      if (+userVerificationDetails.code != user.code) {
        return errorMessage.isNotVerified;
      }

      if (+now > +codeCreatedAt + userConstants.codeExpiryTime) {
        this.resendEmail({ email });
        return errorMessage.codeExpired;
      }

      user.is_verified = true;
      user.code = null;
      user.code_created_at = null;

      await this.userRepository.update({ id }, { ...user });
      return responseMessage.userVerification;
    } catch (e) {
      return e;
    }
  }

  async resendEmail(resendEmailDetails: resendEmailParams) {
    try {
      const email = resendEmailDetails.email.toLowerCase();
      const code = Math.floor(Math.random() * 900000) + 100000;
      const user = await this.userRepository.findOne({ where: { email } });
      const id = user.id;

      if (!user) {
        return errorMessage.emailNotFound;
      }

      if (user.is_verified) {
        return errorMessage.isVerified;
      }

      await this.emailService.sendEmail(
        email,
        createUserSubject,
        createUserText + code,
        null,
      );

      user.code = null;
      user.code_created_at = new Date();
      user.code = code;

      await this.userRepository.update({ id }, { ...user });
      return responseMessage.resendEmail;
    } catch (e) {
      return e;
    }
  }
}

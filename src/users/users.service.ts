import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users';
import { CreateUserParams, UserLoginParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';

import {
  errorMessage,
  saltRounds,
  jwtSecret,
  responseMessage,
  createUserSubject,
  createUserText,
} from 'src/utils/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async createUser(createUserDetails: CreateUserParams) {
    const email = createUserDetails.email.toLowerCase();
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      return errorMessage.emailExists;
    }
    const now = new Date();
    const password = await bcrypt.hash(createUserDetails.password, saltRounds);
    const code = Math.floor(Math.random() * 900000) + 100000;
    const codeExpiry = new Date(now.getTime() + 10 * 60000);
    const createdAt = new Date();
    const updatedAt = new Date();

    const newUser = this.userRepository.create({
      first_name: createUserDetails.firstName,
      last_name: createUserDetails.lastName,
      email: email,
      password: password,
      is_verified: false,
      code: code,
      code_expiry: codeExpiry,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    await this.userRepository.save(newUser);
    await this.emailService.sendEmail(
      email,
      createUserSubject,
      createUserText + code,
    );

    return responseMessage.userCreation;
  }

  async loginUser(userLoginDetails: UserLoginParams) {
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
    const payload = { id: user.id };
    const accessToken = jwt.sign(payload, jwtSecret);
    return { ...responseMessage.userLogin, accessToken };
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ResendEmailDto,
  UserLoginDto,
  UserVerificationDto,
} from 'src/utils/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { createUserSubject, responseMessage } from 'src/utils/constants';
import { EmailService } from 'src/email/email.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private emailService: EmailService,
  ) {}

  @Post('/signup')
  async userSignup(@Body() payload: CreateUserDto) {
    const createUser = await this.userService.createUser(payload);
    if (createUser.isError) return createUser;

    await this.emailService.sendEmail(
      payload.email,
      createUserSubject,
      createUser.message,
      null,
    );

    return responseMessage.userCreation;
  }

  @Post('/resendEmail')
  async resendEmail(@Body() payload: ResendEmailDto) {
    const user = await this.userService.resendEmail(payload);
    if (user.isError) return user;
    await this.emailService.sendEmail(
      payload.email,
      createUserSubject,
      user.message,
      null,
    );
    return responseMessage.resendEmail;
  }

  @Post('/verify')
  userVerify(@Body() payload: UserVerificationDto) {
    return this.userService.verifyUser(payload);
  }

  @Post('/login')
  userLogin(@Body() payload: UserLoginDto) {
    return this.userService.loginUser(payload);
  }
}

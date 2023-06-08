import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ResendEmailDto,
  UserLoginDto,
  UserVerificationDto,
} from 'src/utils/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/signup')
  async userSignup(@Body() CreateInvoiceDto: CreateUserDto) {
    return await this.userService.createUser(CreateInvoiceDto);
  }

  @Post('/login')
  userLogin(@Body() userLoginDto: UserLoginDto) {
    return this.userService.loginUser(userLoginDto);
  }

  @Post('/verify')
  userVerify(@Body() userVerificationDto: UserVerificationDto) {
    return this.userService.verifyUser(userVerificationDto);
  }

  @Post('/resendEmail')
  resendEmail(@Body() resendEmailDto: ResendEmailDto) {
    return this.userService.resendEmail(resendEmailDto);
  }
}

import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UserLoginDto,
  UserVerificationDto,
} from 'src/utils/user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/signup')
  @UsePipes(new ValidationPipe())
  userSignup(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('/login')
  @UsePipes(new ValidationPipe())
  userLogin(@Body() userLoginDto: UserLoginDto) {
    return this.userService.loginUser(userLoginDto);
  }

  @Post('/verify')
  @UsePipes(new ValidationPipe())
  userVerify(@Body() userVerificationDto: UserVerificationDto) {
    return this.userService.verifyUser(userVerificationDto);
  }
}

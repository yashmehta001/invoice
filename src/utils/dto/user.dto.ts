import {
  IsNotEmpty,
  MinLength,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3, {
    message: 'First Name must have atleast 3 characters',
  })
  firstName: string;
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Last Name must have atleast 3 characters',
  })
  lastName: string;
  @IsNotEmpty()
  @IsEmail({})
  email: string;

  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class EmailDto {
  @IsEmail()
  email: string;

  number: string;
}

export class UserLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class UserVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Length(6)
  otp: string;
}

export class ResendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class getInvoicesDto {
  @IsNotEmpty()
  user: string;
}

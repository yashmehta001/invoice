import { HttpException, HttpStatus } from '@nestjs/common';
import { responseObject } from './types';

export class CustomException extends HttpException {
  constructor(response: responseObject) {
    super(response, HttpStatus.BAD_REQUEST);
  }
}

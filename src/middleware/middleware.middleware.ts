import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { constants } from 'src/config/config';
import { User } from 'src/entities/users';
import { errorMessage } from 'src/utils/constants';
import { Repository } from 'typeorm';

@Injectable()
export class MiddlewareMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  use(req: any, res: any, next: () => void) {
    const token: string = req.headers['accesstoken'] as string;
    jwt.verify(token, constants.jwtSecret, async (err, data: any) => {
      try {
        if (!token || err) {
          return errorMessage.invalidJwt;
        }
        const user = await this.userRepository.findOne({
          where: { id: data.id },
        });
        req.headers.user = user.id;
        next();
      } catch (e) {
        return e;
      }
    });
  }
}

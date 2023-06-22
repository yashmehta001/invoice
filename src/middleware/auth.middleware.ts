import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { config } from '../utils/constants';
import { User } from 'src/entities/users';
import { errorMessage } from 'src/utils/constants';
import { Repository } from 'typeorm';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async use(req: any, res: any, next: () => void) {
    try {
      console.log('--------------------------------------------------------');
      const { accesstoken } = req.headers;
      if (!accesstoken) throw new Error();

      const data: any = jwt.verify(accesstoken, config.jwt.jwtSecret);
      const user = await this.userRepository.findOneOrFail({
        where: { id: data.id },
      });
      req.headers.user = user.id;
      next();
    } catch (e) {
      console.error('Middleware error:', e);
      return res.send(errorMessage.invalidJwt);
    }
  }
}

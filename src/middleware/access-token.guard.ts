import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/users/jwt.config';
import { Request } from 'express';
import { errorMessage } from 'src/utils/constants';
import { CustomException } from 'src/utils/custom.exception';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtCofiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new CustomException(errorMessage.invalidJwt);
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtCofiguration,
      );
      request.headers.user = payload.id;
    } catch (e) {
      throw new CustomException(errorMessage.invalidJwt);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    return request.headers.authorization?.split(' ')[1];
  }
}

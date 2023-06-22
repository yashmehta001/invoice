import { SetMetadata } from '@nestjs/common';
import { AuthType } from './types';

export const AUTH_TYPE_KEY = 'authKey';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);

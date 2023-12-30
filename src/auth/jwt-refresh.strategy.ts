import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/users.repository';

import { JwtRefreshPayloadInterface } from './interfaces/jwt-refresh-payload.interface';

export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('jwt.refresh.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-cookie'];
          if (!data) {
            return null;
          }
          return data.refreshToken;
        },
      ]),
    });
  }

  async validate(payload: JwtRefreshPayloadInterface): Promise<User> {
    const { sub: id } = payload;
    const user = await this.usersRepository.findOneBy({ id: +id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

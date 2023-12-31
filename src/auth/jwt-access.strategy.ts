import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/users.repository';

import { JwtAccessPayloadInterface } from './interfaces/jwt-access-payload.interface';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly usersRepository: UsersRepository,
    readonly configService: ConfigService,
  ) {
    console.log(configService.get('jwt.access.secret'));
    super({
      secretOrKey: configService.get('jwt.access.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-cookie'];
          if (!data) {
            return null;
          }
          return data.accessToken;
        },
      ]),
    });
  }

  async validate(payload: JwtAccessPayloadInterface): Promise<User> {
    const { sub: id } = payload;
    const user = await this.usersRepository.findOneBy({ id: +id });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import { PasswordService } from 'src/users/password.service';

import { LoginDto } from './dto/login.dto';
import { JwtAccessPayloadInterface } from './interfaces/jwt-access-payload.interface';
import { JwtRefreshPayloadInterface } from './interfaces/jwt-refresh-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(loginDto: LoginDto) {
    const { phoneNumber, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { phoneNumber },
      select: ['id', 'phoneNumber', 'password'],
    });

    const isRightPassword = await this.passwordService.comparePasswords(
      password,
      user.password,
    );
    if (user && isRightPassword) {
      const accessTokenPayload: JwtAccessPayloadInterface = {
        phoneNumber,
        sub: user.id.toString(),
      };

      const refreshTokenPayload: JwtRefreshPayloadInterface = {
        sub: user.id.toString(),
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.getTokenForType('access', accessTokenPayload),
        this.getTokenForType('refresh', refreshTokenPayload),
      ]);

      return { accessToken, refreshToken };
    }

    throw new UnauthorizedException('Please check your login credentials');
  }

  async refreshToken(user: User) {
    const { id, phoneNumber } = user;
    const accessTokenPayload: JwtAccessPayloadInterface = {
      sub: id.toString(),
      phoneNumber,
    };
    const accessToken = await this.getTokenForType(
      'access',
      accessTokenPayload,
    );

    return accessToken;
  }

  private async getTokenForType(
    jwtType: 'access' | 'refresh',
    payload: JwtAccessPayloadInterface | JwtRefreshPayloadInterface,
  ) {
    const expiresIn: string = this.configService.get(
      `jwt.${jwtType}.expiresIn`,
    );
    const secret = this.configService.get(`jwt.${jwtType}.secret`);
    const token: string = await this.jwtService.sign(payload, {
      expiresIn,
      secret,
    });

    return token;
  }
}

import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import type { Request, Response } from 'express';
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const secretData = await this.authService.login(loginDto);
    res.cookie('auth-cookie', secretData, { httpOnly: true });
    return { message: 'success' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshToken(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken } = req.cookies['auth-cookie'];
    const accessToken = await this.authService.refreshToken(user);
    const secretData = {
      accessToken,
      refreshToken,
    };
    res.cookie('auth-cookie', secretData, { httpOnly: true });
    return { message: 'success' };
  }
}

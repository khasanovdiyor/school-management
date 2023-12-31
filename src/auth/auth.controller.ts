import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import type { Request, Response } from 'express';
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Login with phone number and password' })
  @ApiResponse({
    description:
      'When successful attachs httpOnly auth cookie and returns a success message',
    status: 200,
  })
  @ApiUnauthorizedResponse({
    description: 'When given wrong credentials returns Unauthorized error',
    status: 401,
  })
  @Post('login')
  @HttpCode(200)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const secretData = await this.authService.login(loginDto);
    res.cookie('auth-cookie', secretData, { httpOnly: true });
    return { message: 'success' };
  }

  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiResponse({
    description:
      'When refresh token is valid and not expired updates the auth-cookie with new access token and returns a success message',
    status: 200,
  })
  @ApiUnauthorizedResponse({
    description:
      'When refresh token is not valid and expired returns Unauthorized error',
    status: 401,
  })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
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

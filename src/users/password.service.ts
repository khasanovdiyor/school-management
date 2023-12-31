import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  private pepperify(str: string) {
    const pepper: string = this.configService.get('auth.pepper');
    return createHmac('sha1', pepper).update(str).digest('hex');
  }

  hashPassword(password: string) {
    const saltRounds = this.configService.get('auth.saltRounds');
    return bcrypt.hash(this.pepperify(password), saltRounds);
  }

  comparePasswords(plain: string, cipher: string) {
    return bcrypt.compare(this.pepperify(plain), cipher);
  }
}

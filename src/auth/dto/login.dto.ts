import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @IsString()
  password: string;
}

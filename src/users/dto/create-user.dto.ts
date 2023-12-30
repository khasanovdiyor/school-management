import { IsEnum, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @MinLength(3)
  @MaxLength(255)
  firstName: string;

  @MinLength(3)
  @MaxLength(255)
  lastName: string;

  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @IsEnum(UserRole)
  role: UserRole;

  @MinLength(8)
  password: string;
}

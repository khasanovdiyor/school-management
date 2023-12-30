import { MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @MinLength(3)
  @MaxLength(255)
  name: string;
}

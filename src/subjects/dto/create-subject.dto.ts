import { MaxLength, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @MaxLength(255)
  @MinLength(3)
  name: string;
}

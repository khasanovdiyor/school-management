import { IsNumber } from 'class-validator';

export class AddTeacherDto {
  @IsNumber()
  teacherId: number;

  @IsNumber()
  subjectId: number;
}

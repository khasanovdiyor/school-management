import { IsEnum, IsNumber } from 'class-validator';
import { Grade } from 'src/users/enums/grade.enum';

export class GradeStudentForSubjectDto {
  @IsNumber()
  subjectId: number;

  @IsNumber()
  studentId: number;

  @IsEnum(Grade)
  grade: Grade;
}

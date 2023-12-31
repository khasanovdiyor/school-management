import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';

import { User } from './user.entity';
import { Grade } from '../enums/grade.enum';

@Entity()
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  @ManyToOne(() => User, (user) => user.studentGrades)
  student: User;

  @ManyToOne(() => Subject)
  subject: Subject;
}

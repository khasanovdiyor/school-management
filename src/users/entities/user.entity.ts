import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

import { UserRole } from '../enums/user-role.enum';
import { StudentGrade } from './student-subject.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Unique(['password'])
  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => Group, (group) => group.students)
  group: Group;

  @ManyToMany(() => Subject)
  @JoinTable()
  teacherSubjects: Subject[];

  @OneToMany(() => StudentGrade, (grade) => grade.student)
  studentGrades: StudentGrade[];
}

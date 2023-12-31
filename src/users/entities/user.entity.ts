import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

import { UserRole } from '../enums/user-role.enum';
import { StudentGrade } from './student-grade.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => Group, (group) => group.students)
  group: Group;

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable({
    name: 'teacher-subjects-subject',
    joinColumn: {
      name: 'teacher_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subject_id',
      referencedColumnName: 'id',
    },
  })
  teacherSubjects: Subject[];

  @OneToMany(() => StudentGrade, (grade) => grade.student)
  studentGrades: StudentGrade[];
}

import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

@Entity()
export class Group extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (student) => student.group)
  students: User[];

  @ManyToMany(() => Subject, (subject) => subject.groups)
  @JoinTable({
    name: 'group_subjects_subject',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subject_id',
      referencedColumnName: 'id',
    },
  })
  subjects: Subject[];
}

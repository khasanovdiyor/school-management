import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

@Entity()
export class Group extends BaseEntity {
  @Unique(['name'])
  @Column()
  name: string;

  @OneToMany(() => User, (student) => student.group)
  students: User[];

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[];
}

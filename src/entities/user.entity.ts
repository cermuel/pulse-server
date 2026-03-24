import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PulseEntity } from './pulse.entity';
import { FlairEntity } from './flair.entity';
import { MailEntity } from './mail.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ default: 'free' })
  plan: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PulseEntity, (pulse) => pulse.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  pulses: PulseEntity[];

  @OneToMany(() => FlairEntity, (flair) => flair.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  flairs: FlairEntity[];

  @OneToMany(() => MailEntity, (mail) => mail.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  mails: MailEntity[];
}

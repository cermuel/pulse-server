import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PulseEntity } from './pulse.entity';
import { FlairEntity } from './flair.entity';
import { MailEntity } from './mail.entity';
import { NotificationEntity } from './notification.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  shortHand: string;

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

  @OneToOne(
    () => NotificationEntity,
    (notification: NotificationEntity) => notification.user,
    { cascade: true, nullable: true },
  )
  @JoinColumn()
  notification: NotificationEntity;

  @Column({ nullable: true })
  notificationId: string;

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

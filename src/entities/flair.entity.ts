import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PulseEntity } from './pulse.entity';
import { LogEntity } from './log.entity';

@Entity({ name: 'flair' })
export class FlairEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.flairs, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  pulseId: string;

  @ManyToOne(() => PulseEntity, (pulse) => pulse.flairs, {
    onDelete: 'CASCADE',
  })
  pulse: PulseEntity;

  @OneToMany(() => LogEntity, (log) => log.flair, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  logs: LogEntity[];

  @Column({ nullable: true })
  cause: string;

  @Column({ default: false })
  isResolved: boolean;

  @Column({ nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  startedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PingEntity } from './ping.entity';
import { FlairEntity } from './flair.entity';

@Entity({ name: 'pulse' })
export class PulseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.pulses, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @OneToMany(() => PingEntity, (ping) => ping.pulse, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  pings: PingEntity;

  @OneToMany(() => FlairEntity, (flair) => flair.pulse, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  flairs: FlairEntity[];

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, default: 200 })
  expectedStatus: number;

  @Column({ default: 'GET' })
  method: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 300 })
  interval: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastCheckedAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}

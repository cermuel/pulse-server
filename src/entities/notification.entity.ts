import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.notification, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({ default: true })
  email: boolean;

  @Column({ default: true })
  inAppFlair: boolean;

  @Column({ default: true })
  inAppPing: boolean;

  @Column({ default: false })
  whatsapp: boolean;

  @Column({ default: false })
  telegram: boolean;
}

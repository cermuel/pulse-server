import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resend } from 'resend';
import { MailEntity } from 'src/entities/mail.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(MailEntity)
    private readonly mailRepo: Repository<MailEntity>,
  ) {}
  private resend = new Resend(process.env.RESEND_KEY!);

  async sendMail(email: string, isResolved: boolean, userId: string) {
    const message = isResolved
      ? `<p>Your shortened URL for <strong>${''}</strong> stats is coming soon!</p>`
      : `<p>Your shortened URL for <strong>${''}</strong> stats is coming soon!</p>`;

    const sentMail = await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: email,
      subject: 'Pulse service',
      html: message,
    });

    if (!sentMail) throw new BadRequestException('Error sending email');

    let mail = this.mailRepo.create({
      isResolved,
      email,
      userId,
      message,
    });

    mail = await this.mailRepo.save(mail);
    return mail;
  }
}

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

  async sendMail(
    email: string,
    isResolved: boolean,
    userId: string,
    pulseName?: string,
  ) {
    const appUrl = 'https://pulse.cermuel.dev';
    const safePulseName = pulseName || 'your monitored service';

    const subject = isResolved
      ? `Pulse: ${safePulseName} is back online`
      : `Pulse: ${safePulseName} is down`;

    const message = isResolved
      ? `
        <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f9fc; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px; color: #111827;">Service recovered</h2>
            <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
              Good news — <strong>${safePulseName}</strong> is back online and responding normally again.
            </p>
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              You can open your Pulse dashboard to review the incident timeline, logs, and latest checks.
            </p>

            <a
              href="${appUrl}"
              style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;"
            >
              Open Pulse Dashboard
            </a>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
              This alert was sent by Pulse monitoring.
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f9fc; padding: 32px;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px; color: #111827;">Service incident detected</h2>
            <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
              Pulse detected that <strong>${safePulseName}</strong> may be down or returning an unexpected response.
            </p>
            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
              Open your dashboard to inspect the latest checks, incident activity, and service status.
            </p>

            <a
              href="${appUrl}"
              style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;"
            >
              View in Pulse
            </a>

            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
              This alert was sent by Pulse monitoring.
            </p>
          </div>
        </div>
      `;

    const sentMail = await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: email,
      subject,
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

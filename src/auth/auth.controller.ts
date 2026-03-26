import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    req.logIn(req.user as Express.User, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      req.session.save(() => {
        res.redirect(`${frontendUrl}/auth/callback`);
      });
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    req.logIn(req.user as Express.User, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      req.session.save(() => {
        res.redirect(`${frontendUrl}/auth/callback`);
      });
    });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'User logged out' });
      });
    });
  }
}

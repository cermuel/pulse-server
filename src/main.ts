import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import passport from 'passport';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const redisClient = createClient({
    url: configService.get<string>('REDIS_URL'),
  });

  await redisClient.connect();

  const origin = configService.getOrThrow<string>('ORIGINS').split(',');
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const isProd = nodeEnv === 'production';
  const cookieDomain = configService.get<string>('COOKIE_DOMAIN');

  if (isProd) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: configService.get<string>('SESSION_SECRET')!,
      proxy: isProd,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      },
    }),
  );

  app.enableCors({
    origin,
    credentials: true,
  });

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

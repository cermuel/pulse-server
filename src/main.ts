import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const redis = new Redis(configService.get<string>('REDIS_URL')!);

  let origin = configService.getOrThrow<string>('ORIGINS').split(',');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    session({
      store: new RedisStore({ client: redis }),
      secret: configService.get<string>('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.enableCors({
    origin,
    credentials: true,
  });
  app.use(passport.initialize());
  app.use(passport.session());
  console.log(`App running on: ${process.env.PORT ?? 4000}`);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

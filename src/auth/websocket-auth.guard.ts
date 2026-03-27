import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const user: UserEntity = client.handshake.auth?.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized, please log in');
    }

    return true;
  }
}

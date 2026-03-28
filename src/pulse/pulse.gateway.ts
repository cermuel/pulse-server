import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/auth/websocket-auth.guard';
import { FlairEntity } from 'src/entities/flair.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { UserEntity } from 'src/entities/user.entity';

@UseGuards(WsAuthGuard)
@WebSocketGateway({ cors: true })
export class PulseGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log('Pulse socket running');
  }
  handleConnection(client: Socket) {
    const user = client.handshake.auth?.user as UserEntity;
    if (!user) return;
    if (user.id) {
      client.join(user.id);
      console.log(`User connected with ID: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected with ID: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log({ data: data, client: client });
  }

  sendPing(userId: string, ping: PingEntity) {
    console.log(`Ping sent to user; ${userId}`);
    this.server.to(userId).emit('new-ping', ping);
  }

  sendFlair(userId: string, flair: FlairEntity) {
    console.log(`Flair sent to user; ${userId}`);
    this.server.to(userId).emit('new-flair', flair);
  }

  sendFlairRecovery(userId: string, flair: FlairEntity) {
    console.log(`Flair sent to user; ${userId}`);
    this.server.to(userId).emit('flair-recovery', flair);
  }
}

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
  // handleConnection(client: Socket) {
  //   const user = client.handshake.auth?.user as UserEntity;
  //   if (!user) return;
  //   if (user.id) {
  //     client.join(user.id);
  //     console.log(`User connected with ID: ${client.id}`);
  //   }
  // }

  handleConnection(client: Socket) {
    const user = client.handshake.auth?.user as UserEntity;
    console.log('user from handshake:', user); // ✅ add this
    console.log('user.id:', user?.id); // ✅ and this
    if (!user) return;
    if (user.id) {
      client.join(user.id);
      console.log(`User ${user.id} joined room`); // ✅ confirm room join
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
    console.log('sending ping to userId:', userId); // ✅ is this the right ID?
    console.log('rooms:', this.server.sockets.adapter.rooms); // ✅ is the room there?
    this.server.to(userId).emit('new-ping', ping);
  }
}

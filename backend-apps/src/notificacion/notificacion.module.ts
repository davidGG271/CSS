import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';

@Module({
  controllers: [NotificacionController],
  providers: [NotificacionService],
})
export class NotificacionModule {}

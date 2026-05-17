import { Controller, Post, Body } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';

export interface SendCampaignDto {
  titulo: string;
  mensaje: string;
  tipo: string;
  clientes: { nombre: string; correo: string }[];
  productos: { id: string; nombre: string; precio: number; imagen: string; stock: number }[];
}

@Controller('notificacion')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post('enviar-campana')
  async enviarCampana(@Body() dto: SendCampaignDto) {
    // Retorna de inmediato y envía en segundo plano o espera
    await this.notificacionService.enviarCorreos(dto);
    return { success: true, message: 'Campaña enviada exitosamente' };
  }
}

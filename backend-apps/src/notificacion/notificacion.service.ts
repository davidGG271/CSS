import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendCampaignDto } from './notificacion.controller';

@Injectable()
export class NotificacionService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'pruebamonitor7@gmail.com',
        pass: 'togj fhkc imxh wldz',
      },
    });
  }

  async enviarCorreos(dto: SendCampaignDto) {
    const { titulo, mensaje, tipo, clientes, productos } = dto;

    // Preparar imágenes como adjuntos embebidos (CID)
    const attachments: any[] = [];
    const htmlProductos = productos.map(p => {
      if (p.imagen && p.imagen.startsWith('data:image')) {
        const parts = p.imagen.split(',');
        if (parts.length === 2) {
          const cidId = `prod-${p.id}`;
          attachments.push({
            filename: `imagen-${p.id}.png`,
            content: parts[1],
            encoding: 'base64',
            cid: cidId
          });
          return { ...p, imagenSrc: `cid:${cidId}` };
        }
      }
      return { ...p, imagenSrc: p.imagen || '' };
    });

    for (const cliente of clientes) {
      if (!cliente.correo) continue;

      const htmlContent = this.generarHtml(cliente.nombre, titulo, mensaje, tipo, htmlProductos);

      try {
        await this.transporter.sendMail({
          from: '"CyC Computer" <pruebamonitor7@gmail.com>',
          to: cliente.correo,
          subject: titulo,
          html: htmlContent,
          attachments, // Añadir las imágenes adjuntas embebidas
        });
        console.log(`Correo enviado a ${cliente.correo}`);
      } catch (error) {
        console.error(`Error enviando correo a ${cliente.correo}:`, error);
      }
    }
  }

  private generarHtml(nombreCliente: string, titulo: string, mensaje: string, tipo: string, productos: any[]) {
    // Generar bloque de productos
    const productosHtml = productos.map(p => `
      <div style="background-color: #12121a; border: 1px solid rgba(180, 0, 255, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
        ${p.imagenSrc ? `<img src="${p.imagenSrc}" alt="${p.nombre}" style="max-width: 100%; height: 200px; object-fit: contain; border-radius: 8px; margin-bottom: 15px;" />` : ''}
        <h3 style="color: #ffffff; margin-top: 0; font-family: sans-serif; font-size: 18px;">${p.nombre}</h3>
        <p style="color: #00e5ff; font-weight: bold; font-size: 20px; margin: 10px 0;">S/ ${p.precio}</p>
        <p style="color: #888888; font-size: 12px; margin-bottom: 15px;">Stock disponible: ${p.stock}</p>
        <a href="http://localhost:5173/productos/${p.id}" style="display: inline-block; background: linear-gradient(90deg, #b400ff, #00e5ff); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-family: sans-serif;">¡Ver en tienda!</a>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background-color: #050508; color: #ffffff; font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; background: -webkit-linear-gradient(45deg, #00e5ff, #b400ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .badge { display: inline-block; background-color: rgba(180, 0, 255, 0.1); color: #b400ff; border: 1px solid rgba(180, 0, 255, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
          .content { background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 15px; color: #dddddd; }
          .message { line-height: 1.6; margin-bottom: 30px; color: #bbbbbb; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666666; }
        </style>
      </head>
      <body style="background-color: #050508; color: #ffffff; font-family: sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 900; color: #00e5ff;">CyC <span style="color: #b400ff;">Computer</span></h1>
            <div style="display: inline-block; background-color: rgba(180, 0, 255, 0.1); color: #b400ff; border: 1px solid rgba(180, 0, 255, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">
              ${tipo}
            </div>
            <h2 style="margin: 0; font-size: 24px; color: #ffffff;">${titulo}</h2>
          </div>
          
          <div style="background-color: #0f0f15; border: 1px solid #222; border-radius: 16px; padding: 30px;">
            <p style="font-size: 18px; margin-bottom: 15px; color: #dddddd;">Hola ${nombreCliente},</p>
            <p style="line-height: 1.6; margin-bottom: 30px; color: #bbbbbb; white-space: pre-line;">${mensaje}</p>
            
            ${productos.length > 0 ? `
              <div style="margin-top: 30px;">
                <h3 style="text-align: center; color: #ffffff; margin-bottom: 20px; text-transform: uppercase; font-size: 14px; letter-spacing: 2px;">Productos Destacados</h3>
                ${productosHtml}
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #666666;">
            <p>© 2026 CyC Computer. Todos los derechos reservados.</p>
            <p>Has recibido este correo porque estás suscrito a nuestras notificaciones.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

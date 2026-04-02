
import { Controller, Get, Post, Body, Request, UseGuards,BadRequestException } from '@nestjs/common';
import { MensajeroService } from './mensajero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Query } from '@nestjs/common';

@Controller('mensajero')
export class MensajeroController {

  constructor(private mensajeroService: MensajeroService) {}

@Post('crear-pedido')
@UseGuards(JwtAuthGuard)
async crearPedido(@Body() dto: any, @Request() req) {
  if (!dto || Object.keys(dto).length === 0) {
    throw new BadRequestException("El cuerpo (Body) de la petición está vacío o mal formado");
  }
  
  console.log('DTO recibido:', dto);

  console.log('Usuario del token:', req.user);

return await this.mensajeroService.crearPedido(dto, req.user.id);
}


@Get('buscar-residente')
buscarResidente(@Query('q') query: string) {
  return this.mensajeroService.buscarResidente(query);
}

@Get('perfilmen')
@UseGuards(JwtAuthGuard)
async perfilmen(@Request() req) {
  return this.mensajeroService.obtenerPerfilmen(req.user.id);
}

}

import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { MensajeroService } from './mensajero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Query } from '@nestjs/common';

@Controller('mensajero')
export class MensajeroController {

  constructor(private mensajeroService: MensajeroService) {}

@Post('crear-pedido')
@UseGuards(JwtAuthGuard)
crearPedido(@Body() dto: any, @Request() req) {
  return this.mensajeroService.crearPedido(dto, req.user.id);
}

@Get('buscar-residente')
buscarResidente(@Query('q') query: string) {
  return this.mensajeroService.buscarResidente(query);
}

}
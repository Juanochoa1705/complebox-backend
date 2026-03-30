import { Controller, Get, Post, Param, UseGuards, Req, Body, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResidenteService } from './residente.service';

@Controller('residente')
export class ResidenteController {
  constructor(private residenteService: ResidenteService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mis-pedidos')
  obtenerMisPedidos(@Req() req) {
    // Tip: Verifica si en tu JWT el id se guarda como 'id' o como 'sub'
    const userId = req.user.id || req.user.sub; 
    return this.residenteService.obtenerMisPedidos(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirmar/:id')
  confirmar(@Param('id', ParseIntPipe) id: number) {
    return this.residenteService.confirmarPedido(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('firma/:id')
  firmar(
    @Param('id', ParseIntPipe) id: number, 
    @Body('firma') firma: string // Extraemos directamente la propiedad 'firma' del body
  ) {
    return this.residenteService.firmarPedido(id, firma);
  }
}
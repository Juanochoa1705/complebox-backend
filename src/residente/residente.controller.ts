import { Controller, Get, Post, Param, UseGuards, Req, Body, ParseIntPipe, Request, Query } from '@nestjs/common';
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
  @Param('id') id: number,
  @Body() body: any,
  @Req() req
) {
  return this.residenteService.firmarPedido(
    Number(id),
    body.firma,
    req.user.id // 🔥 ESTE ES EL RESIDENTE
  );
}

  @Get('perfilres')
@UseGuards(JwtAuthGuard)
async perfilres(@Request() req) {
  return this.residenteService.obtenerPerfilres(req.user.id);
}

@UseGuards(JwtAuthGuard)
@Get('historial')
historialResidente(
  @Req() req: any,
  @Query('query') query: string
) {
  console.log("USER:", req.user); // 🔥 DEBUG

  const residenteId = req.user.id;

  return this.residenteService.historialResidente(query || '', residenteId);
}
}
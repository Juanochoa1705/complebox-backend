import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  Patch,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { AccesoService } from './acceso.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('acceso')
export class AccesoController {

  constructor(private readonly accesoService: AccesoService) {}

  // ==============================
  // 🔍 OBTENER TODOS LOS APTOS
  // ==============================
  @Get('aptos')
  async obtenerAptos() {
    return this.accesoService.obtenerAptos();
  }

  // ==============================
  // 🏢 CAMBIAR APARTAMENTO
  // ==============================
@Post('cambiar-apto')
@UseGuards(JwtAuthGuard)
cambiarApto(@Request() req, @Body() body: { fk_apto: number }) {
  return this.accesoService.cambiarApto(req.user.id, body.fk_apto);
}

@Post('cambiar-empresa-vig')
@UseGuards(JwtAuthGuard)
cambiarEmpresa(
  @Request() req,
  @Body() body: { fk_empresa_vig_conjunto: number }
) {
  return this.accesoService.cambiarEmpresaVig(
    req.user.id,
    body.fk_empresa_vig_conjunto
  );
}


 @Get('empresas')
buscarEmpresas(@Query('q') query: string) {
  return this.accesoService.buscarEmpresas(query);
}

@Get('validar-residente')
@UseGuards(JwtAuthGuard)
validarResidente(@Request() req) {
  return this.accesoService.validarAcceso(req.user.id);
}

@Patch('solicitar/:id')
solicitar(@Param('id') id: string) {
  console.log('ID que llega al controlador (tipo):', typeof id, 'valor:', id);
  return this.accesoService.solicitarAccesoAdmin(Number(id));
}

  @Get('pendientes')
  listarPendientes() {
    return this.accesoService.obtenerSolicitudesPendientes();
  }

  @Patch('aprobar/:id')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.aprobarAcceso(id);
  }


}
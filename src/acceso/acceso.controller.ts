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

 @Get('pendientes-traspaso') // 👈 ¡Ojo aquí! Que no falte ninguna letra
async obtenerTraspasos() {
  return await this.accesoService.obtenerPendientesTraspaso();
}


  @Patch('aprobar/:id')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.aprobarAcceso(id);
  }

  @Patch('rechazar/:id')
rechazar(@Param('id', ParseIntPipe) id: number) {
  return this.accesoService.rechazarAcceso(id);
}

 @Patch('rechazars/:cod_user')
  async rechazars(
    @Param('cod_user', ParseIntPipe) cod_user: number
  ) {
    return await this.accesoService.rechazarAccesos(cod_user);
  }


 

@Post('solicitar-traspaso')
  async solicitard(@Body() data: { userId: number, conjuntoId: number }) {
    return await this.accesoService.crearSolicitudTraspaso(data.userId, data.conjuntoId);
  }

  // Este lo llama el SuperAdmin desde notificaciones.html
  @Post('aprobar-traspaso')
  async aprobard(@Body() data: { userId: number, conjuntoId: number }) {
    return await this.accesoService.ejecutarTraspasoReal(data.userId, data.conjuntoId);
  }

   @Post('anadiradmin')
  async anadir(@Body() data: { userId: number, conjuntoId: number }) {
    return await this.accesoService.anadiradmin(data.userId, data.conjuntoId);
  }


@Get('conjuntos') // GET http://localhost:3000/acceso/conjuntos
async listarConjuntos() {
  return await this.accesoService.obtenerConjuntos();
}
}
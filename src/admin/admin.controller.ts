import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Request,
  UnauthorizedException,
  Param,
  Query,
  Put,
  Delete
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';



@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('conjunto')
  async crearConjunto(
    @Req() req: any,
    @Body() dto: CreateConjuntoDto,
  ) {
    const codAdmin = req.user.id; // usa el mismo que tu JWT imprime

    return this.adminService.crearConjunto(codAdmin, dto);
  }

 @UseGuards(JwtAuthGuard)
@Get('conjunto')
async obtenerConjuntoAdmin(@Request() req){
  return this.adminService.obtenerConjuntoAdmin(req.user.id);
}

  @Get('torres')
  async obtenerTorres(@Req() req: any) {
    const codAdmin = req.user.id;
    return this.adminService.obtenerTorresAdmin(codAdmin);
  }

  @Post('torres')
  async crearTorre(
    @Req() req: any,
    @Body() body: { numero_torre: number },
  ) {
    const codAdmin = req.user.id;
    return this.adminService.crearTorre(codAdmin, body.numero_torre);
  }

  @Post('upload-propietarios')
@UseInterceptors(
  FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
  }),
)

async uploadPropietarios(@UploadedFile() file: Express.Multer.File) {
  return this.adminService.processExcel(file);
}


@Post('crear-empresa-seguridad')
@UseGuards(JwtAuthGuard)
async crearEmpresa(
  @Req() req,
  @Body() dto: CrearEmpresaDto
) {
  const adminId = req.user.id;

  return this.adminService.crearEmpresaSeguridad(req.user.id, dto);
}

  @UseGuards(JwtAuthGuard)
  @Get('vigilantes-pendientes')
  async vigilantesPendientes(@Request() req) {

      
    return this.adminService.vigilantesPendientes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('aprobar-vigilante')
  async aprobarVigilante(@Body() body) {
    return this.adminService.aprobarVigilante(body.cod_user);
  }

  @UseGuards(JwtAuthGuard)
@Post('rechazar/:id')
rechazarVigilante(@Param('id') id: number, @Request() req) {

  // 🔐 opcional pero recomendado
  if (req.user.rol !== 'Administrador') {
    throw new UnauthorizedException('No tienes permisos');
  }

  return this.adminService.rechazarVigilante(Number(id));
}

@Get('historial')
@UseGuards(JwtAuthGuard)
async historial(@Query('query') query: string, @Req() req: any) {

  const userId = req.user.id;
  const rol = req.user.rol;

  return this.adminService.historial(query || '', userId, rol);
}
@Put('torres/:id')
async actualizarTorre(
  @Req() req,
  @Param('id') id: string,
  @Body() body: { numero_torre: number }
) {
  return this.adminService.actualizarTorre(
    req.user.id,
    Number(id),
    body.numero_torre
  );
}
@Delete('torres/:id')
async eliminarTorre(
  @Req() req,
  @Param('id') id: string
) {
  return this.adminService.eliminarTorre(
    req.user.id,
    Number(id)
  );
}
}

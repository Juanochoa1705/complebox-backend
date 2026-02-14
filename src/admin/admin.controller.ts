import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('conjunto')
  async crearConjunto(
    @Req() req: any,
    @Body() dto: CreateConjuntoDto,
  ) {
    const codAdmin = req.user.userId; // usa el mismo que tu JWT imprime
    return this.adminService.crearConjunto(codAdmin, dto);
  }

  @Get('conjunto')
  async obtenerConjunto(@Req() req: any) {
    const codAdmin = req.user.userId;
    return this.adminService.obtenerConjuntoAdmin(codAdmin);
  }

  @Get('torres')
  async obtenerTorres(@Req() req: any) {
    const codAdmin = req.user.userId;
    return this.adminService.obtenerTorresAdmin(codAdmin);
  }

  @Post('torres')
  async crearTorre(
    @Req() req: any,
    @Body() body: { numero_torre: number },
  ) {
    const codAdmin = req.user.userId;
    return this.adminService.crearTorre(codAdmin, body.numero_torre);
  }
}

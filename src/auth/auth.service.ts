import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CrearVigilanteDto } from './dto/crear-vigilante.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER GENERAL
  // =========================
  async register(dto: RegisterDto) {

    const userExists = await this.prisma.persona.findFirst({
      where: {
        OR: [{ usuario: dto.usuario }, { correo: dto.correo }],
      },
    });

    if (userExists) {
      throw new ConflictException('El usuario o correo ya existe');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.persona.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: dto.cedula ?? null,
        correo: dto.correo,
        telefono: dto.telefono,
        usuario: dto.usuario,
        contrase_a: hashedPassword,

        estado: {
          connect: { cod_estado: 1 }, // Activo
        },

        rol: {
          connect: { cod_rol: dto.fk_rol },
        },

        tipo_doc: {
          connect: { cod_tipo_doc: dto.fk_tipo_doc },
        },
      },
    });

    return {
      message: 'Usuario registrado correctamente',
    };
  }

  // =========================
  // REGISTER RESIDENTE
  // =========================
  async registerResidente(dto: RegisterDto) {

    const userExists = await this.prisma.persona.findFirst({
      where: {
        OR: [{ usuario: dto.usuario }, { correo: dto.correo }],
      },
    });

    if (userExists) {
      throw new ConflictException('El usuario o correo ya existe');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const persona = await this.prisma.persona.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: dto.cedula ?? null,
        correo: dto.correo,
        telefono: dto.telefono,
        usuario: dto.usuario,
        contrase_a: hashedPassword,

        rol: { connect: { cod_rol: 3 } }, // Residente
        estado: { connect: { cod_estado: 1 } }, // activo
        tipo_doc: { connect: { cod_tipo_doc: dto.fk_tipo_doc } },
      },
    });

    await this.prisma.apto_residente.create({
      data: {
        fk_cod_residente: persona.cod_user,
        fk_cod_apto: dto.fk_apto,
        fk_estado_apto_residente: 3,
      },
    });

    return {
      message:
        'Residente registrado correctamente. Pendiente aprobación.',
    };
  }

// =========================
// LOGIN
// =========================
async login(dto: LoginDto) {
  const user = await this.prisma.persona.findFirst({
    where: { usuario: dto.usuario },
    include: { rol: true, estado: true },
  });

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isValid = await bcrypt.compare(dto.password, user.contrase_a);

  if (!isValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // =========================
  // 🔥 VALIDACIONES POR ROL
  // =========================

  // 🟡 VIGILANTE
  if (user.rol.nombre_rol === 'Vigilante') {

    const vigilancia = await this.prisma.empresa_vigilante_conjunto.findFirst({
      where: {
        fk_persona_vigilante: user.cod_user
      }
    });

    if (vigilancia && [2, 3].includes(vigilancia.fk_estado_vigilante_empresa)) {
      throw new UnauthorizedException(
        'Tu usuario está inactivo. Por favor contacta al administrador para activarlo.'
      );
    }
  }

  // 🟢 RESIDENTE
  if (user.rol.nombre_rol === 'Residente') {

    const residente = await this.prisma.apto_residente.findFirst({
      where: {
        fk_cod_residente: user.cod_user
      }
    });

    if (residente && [2, 3].includes(residente.fk_estado_apto_residente)) {
      throw new UnauthorizedException(
        'Tu acceso está pendiente. Por favor contacta al propietario para activar tu usuario.'
      );
    }
  }

  // =========================
  // PRIMER LOGIN
  // =========================
  if (user.estado.cod_estado === 2) {
    return {
      primerLogin: true,
      user: {
        id: user.cod_user,
        usuario: user.usuario,
        rol: user.rol.nombre_rol,
      },
      message: 'Debe cambiar la contraseña antes de continuar',
    };
  }

  // =========================
  // LOGIN NORMAL
  // =========================
  const payload = {
    sub: user.cod_user,
    usuario: user.usuario,
    rol: user.rol.nombre_rol,
  };

  const token = this.jwtService.sign(payload);

  return {
    token,
    user: {
      id: user.cod_user,
      usuario: user.usuario,
      rol: user.rol.nombre_rol,
    },
  };
}

  // =========================
  // CAMBIAR PASSWORD PRIMER LOGIN
  // =========================
  async cambiarPasswordPrimerLogin(
    userId: number,
    nuevaPassword: string,
  ) {
    const hash = await bcrypt.hash(nuevaPassword, 10);

    await this.prisma.persona.update({
      where: { cod_user: userId },
      data: {
        contrase_a: hash,
        estado: {
          connect: { cod_estado: 1 }, // Activo
        },
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // =========================
  // LISTAR APTOS
  // =========================
  async findAllAptos() {
    return this.prisma.apto.findMany({
      select: {
        cod_apto: true,
        numero_apto: true,
        fk_cod_torre: true,
      },
    });
  }

  async registrarVigilante(dto: CrearVigilanteDto) {

  // 1️⃣ Crear persona INACTIVA
  const persona = await this.prisma.persona.create({
    data: {
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      cedula: dto.cedula,
      correo: dto.correo,
      telefono: dto.telefono,
      usuario: dto.usuario,
      contrase_a: await bcrypt.hash(dto.password, 10),

      estado: {
        connect: { cod_estado: 1 } // 🔥 ACTIVO
      },

      rol: {
        connect: { cod_rol: 4 } // Rol vigilante
      },

     tipo_doc: {
  connect: { cod_tipo_doc: dto.fk_tipo_doc }
},
    },
  });

  // 2️⃣ Crear relación empresa-vigilante INACTIVA
  await this.prisma.empresa_vigilante_conjunto.create({
    data: {
      fk_persona_vigilante: persona.cod_user,
      fk_cod_empresa_vig_conjunto: dto.fk_empresa_vig_conjunto,
      fk_estado_vigilante_empresa: 2, // 🔥 INACTIVO
    },
  });

  return { message: "Vigilante registrado. Pendiente aprobación." };
}

  // =========================
// BUSCAR EMPRESA POR NIT
// =========================
async buscarEmpresaPorNit(nit: string) {

  const empresa = await this.prisma.empresa.findUnique({
    where: { nit_empresa: nit }
  });

  return empresa || null;
}

// =========================
// REGISTER MENSAJERO
// =========================
async registerMensajero(dto: any) {

  let empresa = await this.prisma.empresa.findUnique({
    where: { nit_empresa: dto.nit_empresa }
  });

  if (!empresa) {
    empresa = await this.prisma.empresa.create({
      data: {
        nit_empresa: dto.nit_empresa,
        nombre_empresa: dto.nombre_empresa,
        direccion_empresa: dto.direccion_empresa,
        telefono_empresa: dto.telefono_empresa,
        correo_empresa: dto.correo_empresa,
        fk_estado_empresa: 1
      }
    });
  }

  const persona = await this.prisma.persona.create({
    data: {
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      cedula: dto.cedula,
      correo: dto.correo,
      telefono: dto.telefono,
      usuario: dto.usuario,
      contrase_a: await bcrypt.hash(dto.password, 10),

      estado: { connect: { cod_estado: 1 } },
      rol: { connect: { cod_rol: 5 } },
      tipo_doc: { connect: { cod_tipo_doc: dto.fk_tipo_doc } }
    }
  });

  await this.prisma.empresa_mensajero.create({
    data: {
      fk_persona_mensajero: persona.cod_user,
      fk_empresa_mensajero: empresa.cod_empresa
    }
  });

  return { message: "Mensajero registrado correctamente" };
}
}
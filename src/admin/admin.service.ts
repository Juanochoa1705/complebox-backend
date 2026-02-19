import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async crearConjunto(codAdmin: number, dto: CreateConjuntoDto) {
    const conjunto = await this.prisma.conjunto.create({
      data: {
        nombre_conjunto: dto.nombre_conjunto,
        telefono_conjunto: dto.telefono_conjunto,
      },
    });

    for (let i = 1; i <= dto.cantidad_torres; i++) {
      await this.prisma.torre.create({
        data: {
          numero_torre: i,
          fk_cod_conjunto: conjunto.cod_conjunto,
        },
      });
    }

    await this.prisma.adminConjunto.create({
      data: {
        fk_cod_conjunto: conjunto.cod_conjunto,
        fk_cod_administrador: codAdmin,
      },
    });

    return { message: 'Conjunto creado correctamente' };
  }

  async obtenerConjuntoAdmin(codAdmin: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
      include: { conjunto: true },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return adminConjunto.conjunto;
  }

  async obtenerTorresAdmin(codAdmin: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return this.prisma.torre.findMany({
      where: {
        fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      },
      orderBy: {
        numero_torre: 'asc',
      },
    });
  }

  async crearTorre(codAdmin: number, numero: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return this.prisma.torre.create({
      data: {
        numero_torre: numero,
        fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      },
    });
  }

  // ✅ MÉTODO CORREGIDO Y DENTRO DE LA CLASE
async processExcel(file: Express.Multer.File) {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  for (const row of data as any[]) {

    // 🔹 1️⃣ VALIDAR TORRE
    const numeroTorre = Number(row.numero_torre);

    if (isNaN(numeroTorre)) {
      console.log('Número de torre inválido:', row);
      continue;
    }

    const torreDB = await this.prisma.torre.findFirst({
      where: { numero_torre: numeroTorre },
    });

    if (!torreDB) {
      console.log(`La torre ${numeroTorre} no existe`);
      continue;
    }

    // 🔹 2️⃣ CREAR O BUSCAR PERSONA
    const cedulaStr = String(row.cedula).trim();
    const telefonoStr = String(row.telefono).trim();
    const usuarioStr = cedulaStr;

    if (!cedulaStr) {
      console.log('Cédula inválida:', row);
      continue;
    }

    let persona = await this.prisma.persona.findUnique({
      where: { cedula: cedulaStr },
    });

    if (!persona) {

const hash = await bcrypt.hash('123456', 10);

persona = await this.prisma.persona.create({
  data: {
    nombres: row.nombres,
    apellidos: row.apellidos,
    cedula: cedulaStr,
    correo: row.correo,
    telefono: telefonoStr,
    usuario: usuarioStr,
    contrase_a: hash,

    estado: {
      connect: { cod_estado: 2 } // 👈 INACTIVO
    },

    rol: {
      connect: { cod_rol: 2 }
    },

    tipo_doc: {
      connect: { cod_tipo_doc: Number(row.fk_tipo_doc) }
    },
  },
});
}
    // 🔹 3️⃣ CREAR O BUSCAR APTO
    const numeroApto = Number(row.numero_apto);

    if (isNaN(numeroApto)) {
      console.log('Número de apto inválido:', row);
      continue;
    }

    let aptoDB = await this.prisma.apto.findFirst({
      where: {
        fk_cod_torre: torreDB.cod_torre,
        numero_apto: numeroApto,
      },
    });

    if (!aptoDB) {
      aptoDB = await this.prisma.apto.create({
        data: {
          numero_apto: numeroApto,
          fk_cod_torre: torreDB.cod_torre,
        },
      });
    }

    // 🔹 4️⃣ CREAR O ACTUALIZAR RELACIÓN
    const estadoNuevo = Number(row.fk_estado_apto_propietario);

    if (isNaN(estadoNuevo)) {
      console.log('Estado inválido:', row);
      continue;
    }

    const relacion = await this.prisma.apto_propietario.findFirst({
      where: {
        fk_cod_apto: aptoDB.cod_apto,
        fk_cod_propietario: persona.cod_user,
      },
    });

    if (!relacion) {
      // Crear relación
      await this.prisma.apto_propietario.create({
        data: {
          fk_cod_apto: aptoDB.cod_apto,
          fk_cod_propietario: persona.cod_user,
          fk_estado_apto_propietario: estadoNuevo,
        },
      });
    } else if (relacion.fk_estado_apto_propietario !== estadoNuevo) {
      // Actualizar solo si cambió el estado
      await this.prisma.apto_propietario.update({
        where: {
          cod_apto_propietario: relacion.cod_apto_propietario, // 👈 usa tu PK real
        },
        data: {
          fk_estado_apto_propietario: estadoNuevo,
        },
      });
    }
  }

  return { message: 'Carga masiva completada correctamente' };
}

async crearEmpresaSeguridad(dto: CrearEmpresaDto) {

  // 1️⃣ Crear empresa
  const empresa = await this.prisma.empresa.create({
    data: {
      nit_empresa: dto.nit,
      nombre_empresa: dto.nombre,
      direccion_empresa: dto.direccion,
      telefono_empresa: dto.telefono,
      correo_empresa: dto.correo,
      fk_estado_empresa: 1 // activo
    }
  });

  // 2️⃣ Relacionar con conjunto
  await this.prisma.empresa_seguridad_conjunto.create({
    data: {
      fecha_registro: new Date(),
      fk_cod_conjunto: dto.fk_conjunto,
      fk_empresa_vig: empresa.cod_empresa,
      fk_estado_empresa_seguridad_conjunto: 1
    }
  });

  return {
    message: 'Empresa de seguridad creada correctamente'
  };
  
}




}

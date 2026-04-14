import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async crearConjunto(codAdmin: number, dto: CreateConjuntoDto) {
    const conjunto = await this.prisma.conjunto.create({
      data: {
        nombre_conjunto: dto.nombre_conjunto,
        telefono_conjunto: dto.telefono_conjunto,
        ciudad_conjunto: dto.ciudad_conjunto,
        direccion_conjunto: dto.direccion_conjunto
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


    async obtenerConjuntoAdmin(adminId: number) {

  const adminConj = await this.prisma.adminConjunto.findFirst({
    where:{
      fk_cod_administrador: adminId
    },
    include:{
      conjunto:true
    }
  });

  if(!adminConj){
    throw new NotFoundException("Admin sin conjunto");
  }

  return adminConj.conjunto;

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
    try {

      // ==========================
      // 🔹 LIMPIEZA DE DATOS
      // ==========================
      const nombres = String(row.nombres || '').trim();
      const apellidos = String(row.apellidos || '').trim();
      const cedulaStr = String(row.cedula || '').trim();
      const correo = String(row.correo || '').trim();
      const telefonoStr = String(row.telefono || '').trim();
      const tipoDocNombre = String(row.tipo_doc || '').trim();
      const conjuntoNombre = String(row.conjunto || '').trim();
      const numeroTorre = Number(row.numero_torre);
      const numeroApto = Number(row.numero_apto);
      const estadoNombre = String(row.estado_apto_propietario || '').trim();

      // ==========================
      // 🔹 VALIDACIONES BÁSICAS
      // ==========================
      if (!cedulaStr) {
        console.log('❌ Cédula inválida:', row);
        continue;
      }

      if (isNaN(numeroTorre) || isNaN(numeroApto)) {
        console.log('❌ Torre o apto inválido:', row);
        continue;
      }

      // ==========================
      // 🔹 BUSCAR CONJUNTO 🔥
      // ==========================
      const conjunto = await this.prisma.conjunto.findFirst({
  where: {
    nombre_conjunto: {
      contains: conjuntoNombre
    }
  }
});

      if (!conjunto) {
        console.log('❌ Conjunto no encontrado:', conjuntoNombre);
        continue;
      }

      // ==========================
      // 🔹 BUSCAR TORRE (POR CONJUNTO 🔥)
      // ==========================
      const torreDB = await this.prisma.torre.findFirst({
        where: {
          numero_torre: numeroTorre,
          fk_cod_conjunto: conjunto.cod_conjunto
        }
      });

      if (!torreDB) {
        console.log(`❌ Torre ${numeroTorre} no existe en ${conjuntoNombre}`);
        continue;
      }

      // ==========================
      // 🔹 BUSCAR TIPO DOCUMENTO
      // ==========================
      const tipoDoc = await this.prisma.tipo_doc.findFirst({
  where: {
    nombre_tipo_doc: {
      contains: tipoDocNombre
    }
  }
});

      if (!tipoDoc) {
        console.log('❌ Tipo doc no encontrado:', tipoDocNombre);
        continue;
      }

      // ==========================
      // 🔹 BUSCAR ESTADO
      // ==========================
      const estadoApto = await this.prisma.estado.findFirst({
  where: {
    nombre_estado: {
      contains: estadoNombre
    }
  }
});
      if (!estadoApto) {
        console.log('❌ Estado no encontrado:', estadoNombre);
        continue;
      }

      // ==========================
      // 🔹 CREAR O BUSCAR PERSONA
      // ==========================
      let persona = await this.prisma.persona.findUnique({
        where: { cedula: cedulaStr }
      });

      if (!persona) {
        const hash = await bcrypt.hash('123456', 10);

        persona = await this.prisma.persona.create({
          data: {
            nombres,
            apellidos,
            cedula: cedulaStr,
            correo,
            telefono: telefonoStr,
            usuario: cedulaStr,
            contrase_a: hash,
            fk_estado_user: 2, // Inactivo por defecto
            fk_rol: 2, // Propietario
            fk_tipo_doc: tipoDoc.cod_tipo_doc
          }
        });
      }

      // ==========================
      // 🔹 CREAR O BUSCAR APTO
      // ==========================
      let aptoDB = await this.prisma.apto.findFirst({
        where: {
          numero_apto: numeroApto,
          fk_cod_torre: torreDB.cod_torre
        }
      });

      if (!aptoDB) {
        aptoDB = await this.prisma.apto.create({
          data: {
            numero_apto: numeroApto,
            fk_cod_torre: torreDB.cod_torre
          }
        });
      }

      // ==========================
      // 🔹 RELACIÓN APTO - PROPIETARIO (UPSERT 🔥)
      // ==========================
      const relacion = await this.prisma.apto_propietario.findFirst({
        where: {
          fk_cod_apto: aptoDB.cod_apto,
          fk_cod_propietario: persona.cod_user
        }
      });

      if (!relacion) {
        await this.prisma.apto_propietario.create({
          data: {
            fk_cod_apto: aptoDB.cod_apto,
            fk_cod_propietario: persona.cod_user,
            fk_estado_apto_propietario: estadoApto.cod_estado
          }
        });
      } else {
        await this.prisma.apto_propietario.update({
          where: {
            cod_apto_propietario: relacion.cod_apto_propietario
          },
          data: {
            fk_estado_apto_propietario: estadoApto.cod_estado
          }
        });
      }


    const existeResidente = await this.prisma.apto_residente.findFirst({
  where: {
    fk_cod_apto: aptoDB.cod_apto,
    fk_cod_residente: persona.cod_user
  }
});

if (!existeResidente) {
  await this.prisma.apto_residente.create({
    data: {
      fk_cod_apto: aptoDB.cod_apto,
      fk_cod_residente: persona.cod_user,
      fk_estado_apto_residente: estadoApto.cod_estado
    }
  });
}

    } catch (error) {
      console.log('❌ Error procesando fila:', row);
      console.log(error.message);
      continue;
    }
  }

  return { message: '✅ Carga masiva completada correctamente' };
}

async crearEmpresaSeguridad(adminId: number, dto: CrearEmpresaDto) {

  // 🔹 1️⃣ Buscar el admin correctamente
  const adminConjunto = await this.prisma.adminConjunto.findFirst({
    where: { fk_cod_administrador: adminId },
  });

  if (!adminConjunto) {
    throw new NotFoundException('Administrador no tiene conjunto asignado');
  }

  // 🔹 2️⃣ Validar si ya existe empresa activa en su conjunto
  const empresaActiva = await this.prisma.empresa_seguridad_conjunto.findFirst({
    where: {
      fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      fk_estado_empresa_seguridad_conjunto: 1, // Activo
    },
  });

  if (empresaActiva) {
    throw new BadRequestException(
      'Ya existe una empresa de seguridad activa para este conjunto.'
    );
  }

  // 🔹 3️⃣ Crear empresa
  const empresa = await this.prisma.empresa.create({
  data: {
    nit_empresa: dto.nit,
    nombre_empresa: dto.nombre,
    direccion_empresa: dto.direccion,
    telefono_empresa: dto.telefono,
    correo_empresa: dto.correo,
    fk_estado_empresa: 1, // 🔥 Activa por defecto
  },
})

  // 🔹 4️⃣ Relacionarla con el conjunto
  await this.prisma.empresa_seguridad_conjunto.create({
    data: {
      fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      fk_empresa_vig: empresa.cod_empresa,
      fk_estado_empresa_seguridad_conjunto: 1,
      fecha_registro: new Date(),
    },
  });

  return {
    message: 'Empresa de seguridad creada correctamente',
  };
}

async vigilantesPendientes(adminId: number) {

  // 1️⃣ buscar conjunto del admin
  const adminConj = await this.prisma.adminConjunto.findFirst({
    where: {
      fk_cod_administrador: adminId
    }
  });

  if (!adminConj) return [];

  // 2️⃣ buscar empresa de seguridad del conjunto
  const empresa = await this.prisma.empresa_seguridad_conjunto.findFirst({
    where: {
      fk_cod_conjunto: adminConj.fk_cod_conjunto
    }
  });

  if (!empresa) return [];

  // 3️⃣ buscar vigilantes de esa empresa
  const vigiConjunto = await this.prisma.empresa_vigilante_conjunto.findMany({
    where: {
      fk_cod_empresa_vig_conjunto: empresa.cod_empresa_vig_conjunto,
      fk_estado_vigilante_empresa: 3
    }
  });

  const vigilantes: any[] = [];

  for (const ar of vigiConjunto) {

    if (!ar.fk_persona_vigilante) continue;

    const persona = await this.prisma.persona.findUnique({
      where: {
        cod_user: ar.fk_persona_vigilante
      }
    });

    if (persona) {
      vigilantes.push({
        cod_user: persona.cod_user,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        cedula: persona.cedula
      });
    }

  }

  return vigilantes;

}

  async aprobarVigilante(codUser: number) {

    await this.prisma.empresa_vigilante_conjunto.updateMany({
      where: {
  fk_persona_vigilante: codUser
},
      data: {
        fk_estado_vigilante_empresa: 1
      }
    });



    return { message: "Vigilante aprobado correctamente" };

  }

  async rechazarVigilante(vigilanteId: number) {

  const vigilante = await this.prisma.persona.findUnique({
    where: { cod_user: vigilanteId }
  });

  if (!vigilante) {
    throw new NotFoundException('El vigilante no existe');
  }

  // 🔥 1. Verificar si tiene relación con empresa
  const tieneRelacion = await this.prisma.empresa_vigilante_conjunto.findFirst({
    where: {
      fk_persona_vigilante: vigilanteId
    }
  });

  // ==============================
  // CASO 1: TIENE RELACIÓN → SOLO INACTIVAR
  // ==============================
  if (tieneRelacion) {

    // 🔥 cambiar estado en la relación
    await this.prisma.empresa_vigilante_conjunto.updateMany({
      where: {
        fk_persona_vigilante: vigilanteId
      },
      data: {
        fk_estado_vigilante_empresa: 2 // 🔴 INACTIVO
      }
    });

    // 🔥 también inactivar la persona
    await this.prisma.persona.update({
      where: {
        cod_user: vigilanteId
      },
      data: {
        fk_estado_user: 2 // 🔴 INACTIVO
      }
    });

    return {
      message: "Vigilante inactivado correctamente"
    };
  }

  // ==============================
  // CASO 2: NO TIENE RELACIÓN → ELIMINAR
  // ==============================
  return this.prisma.persona.delete({
    where: {
      cod_user: vigilanteId
    }
  });
}

async historial(query: string, userId: number, rol: string) {

  if (rol === 'Administrador') {

    return this.prisma.$queryRaw`
      SELECT v.*
      FROM vista_historial_pedidos v

      INNER JOIN admin_conjunto ac
        ON ac.fk_cod_administrador = ${userId}

      WHERE v.cod_conjunto = ac.fk_cod_conjunto
      AND (
        v.nombre_residente LIKE ${'%' + query + '%'}
        OR v.cedula LIKE ${'%' + query + '%'}
        OR v.numero_apto LIKE ${'%' + query + '%'}
        OR v.nombre_pedido LIKE ${'%' + query + '%'}
      )
    `;
  }

  if (rol === 'Vigilante') {

    return this.prisma.$queryRaw`
      SELECT v.*
      FROM vista_historial_pedidos v

      INNER JOIN empresa_vigilante_conjunto evc 
        ON evc.fk_persona_vigilante = ${userId}

      INNER JOIN empresa_seguridad_conjunto esc 
        ON esc.cod_empresa_vig_conjunto = evc.fk_cod_empresa_vig_conjunto

      WHERE v.cod_conjunto = esc.fk_cod_conjunto
      AND (
        v.nombre_residente LIKE ${'%' + query + '%'}
        OR v.cedula LIKE ${'%' + query + '%'}
        OR v.numero_apto LIKE ${'%' + query + '%'}
        OR v.nombre_pedido LIKE ${'%' + query + '%'}
      )
    `;
  }

  return [];
}
}


import { Injectable , NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropietarioService {

  constructor(private prisma: PrismaService) {}

  async residentesPendientes(propietarioId: number) {

    // 1️⃣ buscar apartamento del propietario
    const aptoProp = await this.prisma.apto_propietario.findFirst({
      where: {
        fk_cod_propietario: propietarioId
      }
    });



    if (!aptoProp) {
      return [];
    }

    // 2️⃣ buscar residentes de ese apartamento
    const aptoResidentes = await this.prisma.apto_residente.findMany({
      where: {
        fk_cod_apto: aptoProp.fk_cod_apto,
        fk_estado_apto_residente: 3
      }
    });


    const residentes: any[] = [];

    for (const ar of aptoResidentes) {

      if (!ar.fk_cod_residente) continue;

      const persona = await this.prisma.persona.findUnique({
        where: {
          cod_user: ar.fk_cod_residente
        }
      });

      if (persona) {
        residentes.push({
          cod_user: persona.cod_user,
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          cedula: persona.cedula
        });
      }

    }

    return residentes;

  }

  async aprobarResidente(codUser: number) {

    await this.prisma.apto_residente.updateMany({
      where: {
        fk_cod_residente: codUser
      },
      data: {
        fk_estado_apto_residente: 1
      }
    });

    return { message: "Residente aprobado correctamente" };

  }

  async obtenerPerfil(codUser: number) {
  const persona = await this.prisma.persona.findUnique({
    where: { cod_user: codUser },
    select: { nombres: true, apellidos: true }
  });

  const aptoPropietario = await this.prisma.apto_propietario.findFirst({
    where: { fk_cod_propietario: codUser },
    include: {
      apto: {
        include: { torre: true }
      }
    }
  });

  // 🚨 LÓGICA DE BLOQUEO:
  // Si no tiene apto asignado o si el estado es 3 (Inactivo/Rechazado)
  if (!aptoPropietario || aptoPropietario.fk_estado_apto_propietario === 3) {
    return {
      accesoRestringido: true,
      mensaje: "Aún no estás registrado como propietario en ningún conjunto / apto.",
      nombres: persona?.nombres
    };
  }

  return {
    accesoRestringido: false,
    nombres: persona?.nombres,
    apellidos: persona?.apellidos,
    torre: aptoPropietario?.apto?.torre?.numero_torre,
    apto: aptoPropietario?.apto?.numero_apto
  };
}

async rechazarResidente(residenteId: number) {
  const residente = await this.prisma.persona.findUnique({
    where: { cod_user: residenteId },
  });

  if (!residente) {
    throw new NotFoundException('El residente no existe');
  }

  return await this.prisma.$transaction(async (tx) => {
    // 1. Borramos el vínculo con el apartamento
    await tx.apto_residente.deleteMany({
      where: { fk_cod_residente: residenteId }
    });

    // 2. Consultamos TODAS las relaciones posibles de la persona
    const personaConRoles = await tx.persona.findUnique({
      where: { cod_user: residenteId },
      include: {
        adminConjuntos: true,
        apto_propietario: true,
        empresa_mensajero: true,
        empresa_vigilante_conjunto: true,
        // Estas son las relaciones de pedidos (basadas en tu schema)
        pedido_estado_entrega_residente_pedido_estado_entrega_residente_fk_residenteTopersona: true,
      }
    });

    // 3. Verificamos si queda algún rastro en otras tablas
    const tieneOtrasRelaciones = 
      (personaConRoles?.adminConjuntos?.length ?? 0) > 0 || 
      (personaConRoles?.apto_propietario?.length ?? 0) > 0 ||
      (personaConRoles?.empresa_mensajero?.length ?? 0) > 0 ||
      (personaConRoles?.empresa_vigilante_conjunto?.length ?? 0) > 0 ||
      (personaConRoles?.pedido_estado_entrega_residente_pedido_estado_entrega_residente_fk_residenteTopersona?.length ?? 0) > 0;

    if (!tieneOtrasRelaciones) {
      // 4. Si está totalmente limpio, borramos la persona
      await tx.persona.delete({
        where: { cod_user: residenteId }
      });
      return { message: 'Residente y perfil de usuario eliminados permanentemente.' };
    } else {
      // 5. Si tiene otros roles (ej. es admin o vigilante), solo quitamos el rol de residente
      return { message: 'Vínculo de apartamento eliminado. El perfil se conserva por otros roles activos.' };
    }
  });
}
async obtenerResidentesPropietario(propietarioId: number) {
  return this.prisma.apto_propietario.findMany({
    where: { 
      fk_cod_propietario: propietarioId 
    },
    include: {
      apto: {
        include: {
          apto_residente: {
            where: {
              // FILTRO CLAVE: Traer todos excepto al que tiene mi ID
              NOT: {
                fk_cod_residente: propietarioId
              }
            },
            include: {
              persona: true, // Para traer nombres y apellidos
            }
          }
        }
      }
    }
  });
}

async cambiarEstadoResidente(codResidente: number, estado: number, propietarioId: number) {
  return this.prisma.apto_residente.updateMany({
    where: {
      fk_cod_residente: codResidente,
      NOT: {
        fk_cod_residente: propietarioId // Aquí bloqueamos que se edite a sí mismo
      }
    },
    data: {
      fk_estado_apto_residente: estado
    }
  });
}
}
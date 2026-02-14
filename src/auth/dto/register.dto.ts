export class RegisterDto {
  nombres: string;
  apellidos: string;
  usuario: string;
  password: string;
  correo?: string;
  telefono: string;
  cedula?: string;
  fk_tipo_doc: number;
  fk_rol: number;
}



import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secreto123',
    });
  }

async validate(payload: any) {
  return {
    id: payload.sub, // 👈 AQUÍ ESTÁ EL FIX REAL
    usuario: payload.usuario,
    rol: payload.rol,
  };
}
}

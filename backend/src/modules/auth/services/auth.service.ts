import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Role } from '../../../common/enums/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) return null;

    if (!user.is_active) return null;

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(req: any, res: Response, body: any) {
    const user = req.user;
    const session_id = uuidv4();
    const payload = { email: user.email, sub: String(user.id), role: user.role, session_id: session_id };
    const token = this.jwtService.sign(payload);

    const clientType = req.headers['x-client-type'];

    if (!clientType) {
      throw new UnauthorizedException('Client type tidak valid');
    }

    const isCollector = user.role === "COLLECTOR";

    const isWeb = clientType === 'web';
    const isMobile = clientType === 'mobile';

    // Rule enforcement
    if (
      (isCollector && isWeb) ||          // collector dilarang web
      (!isCollector && isMobile)         // non-collector dilarang mobile
    ) {
      throw new UnauthorizedException('Email dan password tidak valid');
    }

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      message: "Login berhasil!",
      authorization_token: token,
      user: user,
    };
  }

  async register(
    full_name: string,
    email: string,
    number_phone: string,
    nik: string,
    photo: string,
    password: string,
    role: Role,
    is_active: boolean
  ) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Pengguna dengan email ini sudah ada');
    }

    const user = await this.userService.create({
      full_name,
      email,
      number_phone,
      nik,
      photo,
      password: password,
      role,
      is_active,
    });

    const { password: _, ...result } = user;

    return {
      message: "Anda berhasil mendaftar!",
      user: {
        id: String(result.id),
        email: result.email,
        role: result.role,
        full_name: result.full_name,
        is_active: result.is_active,
        number_phone: result.number_phone,
        nik: result.nik,
        photo: result.photo,
      },
    };
  }

  async logout(req: any, res: any) {
    const user = req.user as any;

    const session_id = user.session_id;

    res.clearCookie('access_token');

    return { message: 'Logged out' };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

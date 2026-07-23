import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../modules/user/services/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Tidak ada token, akses ditolak');
    }

    try {
      const payload = this.jwtService.verify(token);

      const user = await this.userService.findById(payload.sub);

      const finalRole = user?.role || payload.role;

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: finalRole,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid, akses ditolak');
    }
  }
}

import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user =
        await this.prismaService.user.create({
          data: { email: dto.email, hash },
        });

      return this.signToken(user.id, user.email);
    } catch (error) {
      throw new ForbiddenException(
        'Credentials Taken',
      );
    }
  }

  async signin(dto: AuthDto) {
    const user =
      await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

    if (!user) {
      throw new ForbiddenException(
        'Credentials are incorrect',
      );
    }

    const passwordMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    if (!passwordMatches) {
      throw new ForbiddenException(
        'Credentials are incorrect',
      );
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret =
      this.configService.get('JWT_SECRET');
    const token = await this.jwtService.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret,
      },
    );

    return {
      access_token: token,
    };
  }
}

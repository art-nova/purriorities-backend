import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AccountsSerializer } from './accounts.serializer';
import { AuthController } from './auth.controller';
import { AuthMapper } from './auth.mapper';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { LocalStrategy } from './local.strategy';
import { SessionsService } from './sessions.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Session]), PassportModule.register({ session: true })],
    providers: [AuthService, SessionsService, AuthMapper, LocalStrategy, AccountsSerializer],
    controllers: [AuthController],
    exports: [SessionsService],
})
export class AuthModule {}

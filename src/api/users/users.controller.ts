import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { NoGlobalAuth } from '../../common/decorators/no-global-auth.decorator';
import { IsNotAuthenticatedGuard } from '../../common/guards/is-not-authenticated.guard';
import { SessionsService } from '../auth/sessions.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ReadUserDto } from './dtos/read-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
    constructor(private readonly service: UsersService, private readonly sessionsService: SessionsService) {}

    /**
     * Registers a new user.
     */
    @ApiCreatedResponse()
    @NoGlobalAuth()
    @UseGuards(IsNotAuthenticatedGuard)
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto): Promise<void> {
        await this.service.create(createUserDto);
    }

    /**
     * Returns the current user.
     */
    @ApiCookieAuth('session')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @Get('me')
    async readMe(@Req() request: Request): Promise<ReadUserDto> {
        return this.service.readOne(request.user['id']);
    }

    @ApiCookieAuth('session')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @Get('me/sync')
    async sync(@Req() request: Request) {
        return this.service.sync(request.user['id']);
    }

    /**
     * Updates the supplied fields for current user.
     */
    @ApiCookieAuth('session')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @Patch('me')
    async updateMe(@Req() request: Request, @Body() updateUserDto: UpdateUserDto): Promise<ReadUserDto> {
        const res = await this.service.update(request.user['id'], updateUserDto);
        if (res.email !== request.user['email']) await this.sessionsService.fullLogout(request.user['email']); // email change => logout for all sessions
        return res;
    }

    /**
     * Deletes the current user.
     */
    @ApiCookieAuth('session')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    @Delete('me')
    async deleteMe(@Req() request: Request): Promise<ReadUserDto> {
        return this.service.delete(request.user['id']);
    }
}

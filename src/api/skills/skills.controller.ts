import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { ReadManySkillsDto } from './dtos/read-many-skills.dto';
import { ReadSkillDto } from './dtos/read-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('Skills')
@ApiCookieAuth('session')
@Controller('api/skills')
export class SkillsController {
    constructor(private readonly service: SkillsService) {}

    @Get('')
    async readMany(@Req() request: Request, @Paginate() query: PaginateQuery): Promise<ReadManySkillsDto> {
        return this.service.readAll(query, request.user['id']);
    }

    @Post('')
    async create(@Req() request: Request, @Body() createSkillDto: CreateSkillDto): Promise<ReadSkillDto> {
        return await this.service.create({ ...createSkillDto, userId: request.user['id'] });
    }

    @Get(':id')
    async readOne(@Req() request: Request, @Param('id') id: string): Promise<ReadSkillDto> {
        return this.service.readOne(id, request.user['id']);
    }

    @Patch(':id')
    async update(
        @Req() request: Request,
        @Param('id') id: string,
        @Body() updateSkillDto: UpdateSkillDto,
    ): Promise<ReadSkillDto> {
        return this.service.update(id, updateSkillDto, request.user['id']);
    }

    @Delete(':id')
    async delete(@Req() request: Request, @Param('id') id: string): Promise<ReadSkillDto> {
        return this.service.delete(id, request.user['id']);
    }
}

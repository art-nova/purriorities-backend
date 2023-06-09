import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateConfig, PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { ReadCatDto } from './dtos/read-cat.dto';
import { ReadManyCatsDto } from './dtos/read-many-cats.dto';
import { Cat } from './entities/cat.entity';

const catsPaginationConfig: PaginateConfig<Cat> = {
    sortableColumns: ['nameId'],
    defaultSortBy: [['nameId', 'DESC']],
};

@Injectable()
export class CatsService {
    constructor(
        @InjectRepository(Cat) private readonly repository: Repository<Cat>,
        @InjectMapper() private readonly mapper: Mapper,
    ) {}

    async readAll(query: PaginateQuery): Promise<ReadManyCatsDto> {
        return this.mapper.map(
            await paginate(query, this.repository, catsPaginationConfig),
            Paginated<Cat>,
            ReadManyCatsDto,
        );
    }

    async readOne(id: string): Promise<ReadCatDto> {
        return this.mapper.map(await this.findOneOrFail(id), Cat, ReadCatDto);
    }

    private async findOneOrFail(id: string): Promise<Cat> {
        const out = await this.repository.findOne({
            where: { nameId: id },
        }); // as FindOptionsWhere<Entity>); // a little help for typescript to figure out that, since id is present in Resource, id is also present in Entity
        if (out === null) throw new NotFoundException('Required resource was not found in the database');
        return out;
    }
}

import {ForbiddenException, Injectable} from "@nestjs/common";
import {ResourceService} from "../../common/resource-base/resource.service-base";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {InjectMapper} from "@automapper/nestjs";
import {Mapper} from "@automapper/core";
import {Category} from "./category.entity";
import {ReadCategoryDto} from "./dtos/read-category.dto";
import {ReadManyCategoriesDto} from "./dtos/read-many-categories.dto";
import {UpdateCategoryDto} from "./dtos/update-category.dto";
import {CreateCategoryDto} from "./dtos/create-category.dto";

@Injectable()
export class CategoriesService extends ResourceService<Category, CreateCategoryDto, ReadCategoryDto, ReadManyCategoriesDto, UpdateCategoryDto> {
    constructor(@InjectRepository(Category) repository: Repository<Category>, @InjectMapper() mapper: Mapper) {
        super(
            repository,
            {
                sortableColumns: ['name'],
                defaultSortBy: [['name', 'ASC']],
                select: ['id', 'name', 'inbox'],
            },
            mapper,
            Category,
            CreateCategoryDto,
            ReadCategoryDto,
            ReadManyCategoriesDto,
            UpdateCategoryDto,
        );
    }

    async getDefault(userId: string): Promise<ReadCategoryDto> {
        return this.repository.findOne({
            where: {
                inbox: true,
                userId
            }
        });
    }

    async delete(id: string, userId?: string): Promise<ReadCategoryDto> {
        const toRemove = await this.findOneOrFail(id, userId);

        if (toRemove.inbox)
            throw new ForbiddenException('Cannot delete inbox category')

        return this.mapper.map(await this.repository.remove(toRemove), this.entityType, this.readOneDtoType);
    }
}

import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Priority } from '../../../common/types/enums';
import { CreateStageDto } from '../../stages/dtos/create-stage.dto';

// export class CreateQuestDto extends PickType(Quest, ['name', 'priority', 'deadline', 'deadlineSetDate', 'limit']) {
//     @IsUUID()
//     categoryId: string;
//
//     @IsUUID(undefined, { each: true })
//     skillIds: string[];
//
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => CreateStageDto)
//     stages: CreateStageDto[];
// }

export class CreateQuestDto {
    @AutoMap()
    @IsNotEmpty()
    name: string;

    @AutoMap()
    @IsEnum(Priority)
    priority: Priority;

    @AutoMap()
    @IsDateString()
    @IsOptional()
    deadline?: string;

    @AutoMap()
    @IsOptional()
    @IsDateString()
    limit?: string;

    @AutoMap()
    @IsOptional()
    @IsInt()
    @Min(1)
    interval?: number;

    @AutoMap()
    @IsUUID()
    category: string;

    @AutoMap()
    @IsUUID(undefined, { each: true })
    skills: string[];

    @AutoMap(() => [CreateStageDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateStageDto)
    stages: CreateStageDto[];
}

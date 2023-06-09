import { AutoMap } from '@automapper/classes';
import { ReadTaskDto } from '../../tasks/dtos/read-task.dto';

// export class ReadStageDto extends PickType(Stage, [
//     'id',
//     'name',
//     'index',
// ]) {
//     @IsUUID()
//     questId: string;
//
//     @IsArray()
//     @ValidateNested({each: true})
//     @Type(() => ReadTaskDto)
//     tasks: ReadTaskDto[]
// }

export class ReadStageDto {
    @AutoMap()
    id: string;

    @AutoMap()
    name: string;

    @AutoMap()
    index: number;

    @AutoMap()
    questId: string;

    @AutoMap(() => [ReadTaskDto])
    tasks: ReadTaskDto[];

    finished: boolean;
}

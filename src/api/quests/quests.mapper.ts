import { Mapper, createMap, forMember, mapFrom, typeConverter } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { getLevelCap } from '../../common/helpers/formulas';
import { createPaginatedToReadManyMap } from '../../common/helpers/mapping';
import { LogicConfigService } from '../../common/processed-config/logic-config.service';
import { ReadCategoryDto } from '../categories/dtos/read-category.dto';
import { ReadSkillDto } from '../skills/dtos/read-skill.dto';
import { ReadStageDto } from '../stages/dtos/read-stage.dto';
import { Stage } from '../stages/entities/stage.entity';
import { ReadTaskDto } from '../tasks/dtos/read-task.dto';
import { Task } from '../tasks/entities/task.entity';
import { CreateQuestDto } from './dtos/create-quest.dto';
import { ReadManyQuestsDto } from './dtos/read-many-quests.dto';
import { ReadQuestDto } from './dtos/read-quest.dto';
import { QuestSkill } from './entities/quest-skill.entity';
import { Quest } from './entities/quest.entity';

const stringToDateConverter = typeConverter(String, Date, (str) => (str ? new Date(str) : null));
//const dateToStringConvertor = typeConverter(Date, String, (date) => date?.toISOString());

@Injectable()
export class QuestsMapper extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper, private readonly logicConfig: LogicConfigService) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                Quest,
                ReadQuestDto,
                forMember<Quest, ReadQuestDto, ReadSkillDto[]>(
                    (readQuestDto) => readQuestDto.skills,
                    mapFrom((quest) => quest.questSkills?.map((qs) => this.mapper.map(qs, QuestSkill, ReadSkillDto))),
                ),
                forMember<Quest, ReadQuestDto, ReadCategoryDto>(
                    (readQuestDto) => readQuestDto.category,
                    mapFrom((quest) => quest.category),
                ),
                forMember(
                    (readQuestDto) => readQuestDto.stages,
                    mapFrom((quest) => quest.stages?.map((stage) => this.mapper.map(stage, Stage, ReadStageDto))),
                ),
                //dateToStringConvertor
            );

            createPaginatedToReadManyMap(mapper, Quest, ReadQuestDto, ReadManyQuestsDto);

            createMap(
                mapper,
                CreateQuestDto,
                Quest,
                forMember<CreateQuestDto, Quest, string>(
                    (quest) => quest.categoryId,
                    mapFrom((createQuestDto) => createQuestDto.category),
                ),
                stringToDateConverter,
            );

            createMap(
                mapper,
                QuestSkill,
                ReadSkillDto,
                forMember<QuestSkill, ReadSkillDto, string>(
                    (readSkillDto) => readSkillDto.name,
                    mapFrom((questSkill) => questSkill?.skill.name),
                ),
                forMember<QuestSkill, ReadSkillDto, string>(
                    (readSkillDto) => readSkillDto.id,
                    mapFrom((questSkill) => questSkill?.skill.id),
                ),
                forMember<QuestSkill, ReadSkillDto, number>(
                    (readSkillDto) => readSkillDto.level,
                    mapFrom((questSkill) => questSkill?.skill.level),
                ),
                forMember<QuestSkill, ReadSkillDto, number>(
                    (readSkillDto) => readSkillDto.levelExp,
                    mapFrom((questSkill) => questSkill?.skill.levelExp),
                ),
                forMember<QuestSkill, ReadSkillDto, number>(
                    (readSkillDto) => readSkillDto.levelCap,
                    mapFrom((questSkill) => getLevelCap(questSkill.skill.level, this.logicConfig.skillExpFormula)),
                ),
                stringToDateConverter,
            );

            createMap(
                mapper,
                Stage,
                ReadStageDto,
                forMember(
                    (readStageDto) => readStageDto.finished,
                    mapFrom((stage) => stage.finishDate != null),
                ),
                forMember(
                    (readStageDto) => readStageDto.tasks,
                    mapFrom((stage) =>
                        stage.tasks.map((task) => {
                            console.log(this.mapper.map(task, Task, ReadTaskDto));
                            return this.mapper.map(task, Task, ReadTaskDto);
                        }),
                    ),
                ),
            );

            createMap(mapper, Task, ReadTaskDto);
        };
    }
}

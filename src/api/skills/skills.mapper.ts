import {Injectable} from "@nestjs/common";
import {AutomapperProfile, InjectMapper} from "@automapper/nestjs";
import {createMap, forMember, mapFrom, Mapper} from "@automapper/core";
import {Skill} from "./skill.entity";
import {ReadSkillDto} from "./dtos/read-skill.dto";
import {ReadManySkillsDto} from "./dtos/read-many-skills.dto";
import {CreateSkillDto} from "./dtos/create-skill.dto";
import {UpdateSkillDto} from "./dtos/update-skill.dto";
import {createPaginatedToReadManyMap} from "../../common/helpers/mapping";
import {LogicConfigService} from "../../common/processed-config/logic-config.service";
import {getLevelCap} from "../../common/helpers/formulas";
import {QuestSkill} from "../quests/entities/quest-skill.entity";
import {ReadShortSkillDto} from "./dtos/read-short-skill.dto";

@Injectable()
export class SkillsMapper extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper, private readonly logicConfig: LogicConfigService) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                Skill,
                ReadSkillDto,
                forMember(
                    (readSkillDto) => readSkillDto.levelCap,
                    mapFrom(skill =>
                        getLevelCap(skill.level, this.logicConfig.skillExpFormula),
                    ), // TODO check
                ),
            );
            createMap(mapper, Skill, ReadShortSkillDto);
            createPaginatedToReadManyMap(mapper, Skill, ReadSkillDto, ReadManySkillsDto);
            createMap(mapper, QuestSkill, ReadSkillDto,
                forMember(
                    (readSkillDto) => readSkillDto.name,
                    mapFrom(questSkill =>
                        questSkill.skill.name,
                    ),
                ));
            createMap(mapper, CreateSkillDto, Skill);
            createMap(mapper, UpdateSkillDto, Skill);
        };
    }
}
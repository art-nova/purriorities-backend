import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { FindOneOptions, Repository } from 'typeorm';
import { ResourceService } from '../../common/resource-base/resource.service-base';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { SkillsService } from '../skills/skills.service';
import { ReadStageDto } from '../stages/dtos/read-stage.dto';
import { Stage } from '../stages/entities/stage.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateQuestDto } from './dtos/create-quest.dto';
import { ReadManyQuestsDto } from './dtos/read-many-quests.dto';
import { ReadQuestDto } from './dtos/read-quest.dto';
import { UpdateQuestDto } from './dtos/update-quest.dto';
import { QuestSkill } from './entities/quest-skill.entity';
import { Quest } from './entities/quest.entity';

@Injectable()
export class QuestsService extends ResourceService<
    Quest,
    CreateQuestDto,
    ReadQuestDto,
    ReadManyQuestsDto,
    UpdateQuestDto
> {
    constructor(
        @InjectRepository(Quest) questRepository: Repository<Quest>,
        @InjectRepository(Task) private tasksRepository: Repository<Task>,
        @InjectRepository(Stage) private stagesRepository: Repository<Stage>,
        @InjectRepository(Category) private categoriesRepository: Repository<Category>,
        @InjectRepository(QuestSkill) private questSkillsRepository: Repository<QuestSkill>,
        @InjectRepository(Skill) private skillsRepository: Repository<Skill>,
        private categoriesService: CategoriesService,
        private skillsService: SkillsService,
        @InjectMapper() mapper: Mapper,
    ) {
        super(
            questRepository,
            {
                defaultLimit: 0,
                maxLimit: 0,
                relations: {
                    stages: {
                        tasks: true,
                    },
                    questSkills: { skill: true },
                    category: true,
                },
                withDeleted: true,
                sortableColumns: ['deadline', 'finished'],
                filterableColumns: {
                    categoryId: [FilterOperator.EQ],
                    finishDate: [FilterOperator.NULL],
                    'questSkills.(skillId)': [FilterOperator.EQ],
                },
            },
            mapper,
            Quest,
            CreateQuestDto,
            ReadQuestDto,
            ReadManyQuestsDto,
            UpdateQuestDto,
        );
    }

    private async checkAccessToQuest(questId: string, userId: string) {
        const category = await this.categoriesRepository.findOne({
            withDeleted: true,
            relations: { quests: true },
            where: { quests: { id: questId } },
        });

        if (!category) throw new NotFoundException('Such quest does not exist');

        await this.categoriesService.readOne(category.id, userId);
    }

    private async checkAccessToCategory(categoryId: string, userId: string) {
        await this.categoriesService.readOne(categoryId, userId);
    }

    private async checkAccessToSkill(skillId: string, userId) {
        await this.skillsService.readOne(skillId, userId);
    }

    async create(createDto: CreateQuestDto, userId?: string): Promise<ReadQuestDto> {
        // limit can only be present when interval is, and interval can only be present when deadline is
        if (createDto.deadline === null && createDto.interval !== null)
            throw new BadRequestException(
                'Malformed quest information: if repetition interval is specified, specific deadline should be as well',
            );
        if (createDto.interval === null && createDto.limit !== null)
            throw new BadRequestException(
                'Malformed quest information: if repetition limit is specified, repetition interval should be as well',
            );

        await this.checkAccessToCategory(createDto.category, userId);

        for (const skillId of createDto.skills) {
            await this.checkAccessToSkill(skillId, userId);
        }

        const quest = this.mapper.map(createDto, this.createDtoType, this.entityType);
        const savedQuest = this.mapper.map(await this.repository.save(quest), this.entityType, this.readOneDtoType);

        for (let i = 0; i < createDto.stages.length; i++) {
            const stage = createDto.stages[i];
            const savedStage = await this.stagesRepository.save({
                ...stage,
                questId: savedQuest.id,
                index: i,
            });
            //console.log(savedStage)

            for (const task of stage.tasks) {
                const savedTask = await this.tasksRepository.save({
                    ...task,
                    stageId: savedStage.id,
                });
                //console.log(savedTask)
            }
        }

        for (let i = 0; i < createDto.skills.length; i++) {
            const skillId = createDto.skills[i];
            const savedSkill = await this.questSkillsRepository.save({
                questId: quest.id,
                skillId: skillId,
                index: i,
            });

            //console.log(savedSkill)
        }

        return await this.readOne(savedQuest.id, userId);
    }

    async readAll(query: PaginateQuery, userId: string): Promise<ReadManyQuestsDto> {
        const queryBuilder = this.repository
            .createQueryBuilder('q')
            .leftJoin('q.category', 'c')
            .where('c.userId = :userId', { userId })
            //TODO it should be passed by query params
            .addOrderBy('q.finished', 'ASC')
            .addOrderBy('q.deadline', 'ASC', 'NULLS LAST');

        query.limit = 0;

        const paginatedQuests = await paginate(query, queryBuilder, this.paginateConfig);

        const quests = this.mapper.map(paginatedQuests, Paginated<Quest>, ReadManyQuestsDto);

        for (const quest of quests.data) {
            const stages = await this.stagesRepository.find({
                relations: { tasks: true },
                where: { questId: quest.id },
                order: { index: 'ASC' },
                withDeleted: true,
            });

            quest.stages = stages.map((stage) => this.mapper.map(stage, Stage, ReadStageDto));
        }

        return quests;
    }

    async readOne(id: string, userId: string): Promise<ReadQuestDto> {
        await this.checkAccessToQuest(id, userId);

        const queryOptions: FindOneOptions<Quest> = {
            where: { id },
            withDeleted: true,
            relations: {
                stages: {
                    tasks: true,
                },
                questSkills: { skill: true },
                category: true,
            },
        };
        return this.mapper.map(await this.repository.findOneOrFail(queryOptions), Quest, ReadQuestDto);
    }

    async delete(id: string, userId: string): Promise<ReadQuestDto> {
        await this.checkAccessToQuest(id, userId);

        return super.delete(id);
    }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesMapper } from '../categories/categories.mapper';
import { Category } from '../categories/category.entity';
import { CatsMapper } from '../cats/cats.mapper';
import { CatOwnership } from '../cats/entities/cat-ownership.entity';
import { Cat } from '../cats/entities/cat.entity';
import { QuestSkill } from '../quests/quest-skill.entity';
import { Quest } from '../quests/quest.entity';
import { QuestsMapper } from '../quests/quests.mapper';
import { Skill } from '../skills/skill.entity';
import { SkillsMapper } from '../skills/skills.mapper';
import { Stage } from '../stages/stage.entity';
import { StagesMapper } from '../stages/stages.mapper';
import { Task } from '../tasks/task.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersMapper } from './users.mapper';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Skill, QuestSkill, Category, Quest, Stage, Task, CatOwnership, Cat])],
    controllers: [UsersController],
    providers: [UsersService, UsersMapper, SkillsMapper, CategoriesMapper, QuestsMapper, StagesMapper, CatsMapper],
})
export class UsersModule {}

import {
    Check,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Lateness } from '../../common/enums/lateness.enum';
import { Priority } from '../../common/enums/priority.enum';
import { getEditingLateness } from '../../common/helpers/penalties.helper';
import { Category } from '../categories/category.entity';
import { Stage } from '../stages/stage.entity';
import { QuestSkill } from './quest-skill.entity';

@Entity('quests')
@Check('deadline IS NOT NULL OR (deadline IS NULL AND limit IS NULL)')
export class Quest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => Category, (category) => category.quests)
    @JoinColumn()
    category: Category;

    @ManyToMany(() => QuestSkill, (questSkill) => questSkill.quest)
    questSkills: QuestSkill[];

    @Column({ type: 'enum', enum: Priority })
    priority: Priority;

    @Column({ nullable: true })
    deadlineSetDate: Date;

    @Column({ nullable: true })
    deadline: Date;

    @Column({ nullable: true })
    limit: Date;

    @OneToMany(() => Stage, (stage) => stage.quest)
    stages: Stage[];

    @DeleteDateColumn()
    finishDate: Date;

    get editingLateness(): Lateness {
        if (!this.deadline) return Lateness.EARLY;
        return getEditingLateness(this.deadlineSetDate, this.deadline, new Date());
    }
}

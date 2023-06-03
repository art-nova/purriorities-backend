import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cat } from '../../cats/cat.entity';
import { User } from './user.entity';
import {IsInt, IsPositive} from "class-validator";

@Entity('cat_ownerships')
export class CatOwnership {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    catNameId: string;

    @ManyToOne(() => User, (user) => user.catOwnerships, {
        onDelete: 'CASCADE',
    })
    user: User;

    @ManyToOne(() => Cat, { onDelete: 'RESTRICT' })
    cat: Cat;

    @IsInt()
    @IsPositive()
    @Column({ default: 1 })
    level: number;

    @CreateDateColumn()
    acquireDate: Date;
}

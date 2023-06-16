import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomFromArray } from '../../common/helpers/random';
import { LogicConfigService } from '../../common/processed-config/logic-config.service';
import { Rarity } from '../../common/types/enums';
import { ReadCatOwnershipDto } from '../cats/dtos/read-cat-ownership.dto';
import { CatOwnership } from '../cats/entities/cat-ownership.entity';
import { Cat } from '../cats/entities/cat.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Cat) private readonly catRepository: Repository<Cat>,
        @InjectRepository(CatOwnership) private readonly catOwnershipRepository: Repository<CatOwnership>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly logicConfig: LogicConfigService,
        @InjectMapper() private readonly mapper: Mapper,
    ) {}

    async gachaCommon(id: string): Promise<ReadCatOwnershipDto> {
        const user = await this.userRepository.findOneBy({ id });
        if (user.feed < this.logicConfig.commonCaseSettings.price)
            throw new BadRequestException('Not enough feed to buy a common case');
        user.feed -= this.logicConfig.commonCaseSettings.price;
        await this.userRepository.save(user);

        const rarity = this.logicConfig.commonCaseRandomRarity();
        return this.rollCatWithRarity(user, rarity);
    }

    async gachaLegendary(id: string): Promise<ReadCatOwnershipDto> {
        const user = await this.userRepository.findOneBy({ id });
        if (user.catnip < this.logicConfig.legendaryCaseSettings.price)
            throw new BadRequestException('Not enough catnip to buy a legendary case');
        user.catnip -= this.logicConfig.legendaryCaseSettings.price;
        await this.userRepository.save(user);

        const rarity = this.logicConfig.legendaryCaseRandomRarity();
        return this.rollCatWithRarity(user, rarity);
    }

    private async rollCatWithRarity(user: User, rarity: Rarity): Promise<ReadCatOwnershipDto> {
        const cat = randomFromArray(await this.catRepository.findBy({ rarity }));
        let catOwnership = await this.catOwnershipRepository.findOneBy({ catNameId: cat.nameId, userId: user.id });
        if (catOwnership === null) {
            catOwnership = this.catOwnershipRepository.create({ cat, user });
        } else {
            catOwnership.level++;
            catOwnership.isAway = false;
        }
        const savedCatOwnership = await this.catOwnershipRepository.save(catOwnership);
        savedCatOwnership.cat = cat;
        return this.mapper.map(savedCatOwnership, CatOwnership, ReadCatOwnershipDto);
    }
}
import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class GuildConfig {

    @PrimaryKey()
    id: string = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    @Property()
    @Index()
    guildId!: string;

    @Property()
    @Index()
    key!: string;

    @Property()
    value!: string;

    constructor(guildId: string, key: string, value: string) {
        this.guildId = guildId;
        this.key = key;
        this.value = value;
    }

}
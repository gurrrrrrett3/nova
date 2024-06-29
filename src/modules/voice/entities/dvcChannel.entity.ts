import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class DvcChannel {

    @PrimaryKey()
    channelId!: string;

    @Property()
    guildId!: string;

}


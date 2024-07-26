import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class DvcLobby {

    @PrimaryKey()
    channelId!: string;

    @Property()
    guildId!: string;

}


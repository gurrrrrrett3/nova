import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";

export enum LogChannelType {
    Message,
    Member
}

@Entity()
export class LogChannel {

    @PrimaryKey()
    channelId!: string;

    @Property()
    guildId!: string;

    @Enum(() => LogChannelType)
    @Property()
    type!: LogChannelType;
}

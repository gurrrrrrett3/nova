import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export default class ReactionRole {
    @PrimaryKey()
    id: string // messageid-emoji

    @Property()
    guildId: string

    @Property()
    channelId: string

    @Property()
    messageId: string

    @Property()
    emoji: string

    @Property()
    roleId: string

    @Property()
    type: ReactionRoleType

    constructor(guildId: string, channelId: string, messageId: string, roleId: string, emoji: string, type: ReactionRoleType) {
        this.id = ReactionRole.buildId(messageId, emoji)
        this.guildId = guildId
        this.channelId = channelId
        this.messageId = messageId
        this.roleId = roleId
        this.emoji = emoji
        this.type = type
    }

    public static buildId(messageId: string, emoji: string) {
        return `${messageId}-${emoji}`
    }
}

export enum ReactionRoleType {
    Add,
    Remove,
    Toggle
}
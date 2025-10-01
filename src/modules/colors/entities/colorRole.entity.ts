import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export default class ColorRole {
    @PrimaryKey()
    roleId: string

    @Property()
    @Index()
    guildId: string

    constructor(guildId: string, roleId: string) {
        this.guildId = guildId;
        this.roleId = roleId;
    }
}
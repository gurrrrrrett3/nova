import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class AutoRole {

    @PrimaryKey()
    roleId!: string;

    @Property()
    guildId!: string;

}
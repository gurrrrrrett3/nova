import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity()
export class AutoRole {

    @PrimaryKey()
    roleId!: string;

    @PrimaryKey()
    guildId!: string;

}
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class RolePickerRole {

    @PrimaryKey()
    roleId!: string;

    @Property()
    guildId!: string;

    @Property()
    name!: string;

    @Property()
    description!: string;

    @Property()
    emoji!: string;

    @Property()
    order!: number;


}
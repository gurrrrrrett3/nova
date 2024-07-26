import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity()
export class Dvc {

    @PrimaryKey()
    channelId!: string;
}

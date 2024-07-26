import { Migration } from '@mikro-orm/migrations';

export class Migration20240726080845 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "dvc" ("channel_id" varchar(255) not null, constraint "dvc_pkey" primary key ("channel_id"));');

    this.addSql('create table "dvc_lobby" ("channel_id" varchar(255) not null, "guild_id" varchar(255) not null, constraint "dvc_lobby_pkey" primary key ("channel_id"));');

    this.addSql('drop table if exists "dvc_channel" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "dvc_channel" ("channel_id" varchar(255) not null default null, "guild_id" varchar(255) not null default null, constraint "dvc_channel_pkey" primary key ("channel_id"));');

    this.addSql('drop table if exists "dvc" cascade;');

    this.addSql('drop table if exists "dvc_lobby" cascade;');
  }

}

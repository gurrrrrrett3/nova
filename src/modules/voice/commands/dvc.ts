import { ChatInputCommandInteraction, OverwriteType } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import VoiceModule from "../index.js";
import EmbedUtil from "../../util/util/embed.js";
import i18next, { t } from "i18next";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { db } from "../../../core/index.js";
import { Dvc } from "../entities/dvc.entity.js";

async function getVoiceChannel(interaction: ChatInputCommandInteraction) {

  const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

  const member = interaction.member;
  if (!member) {
    return null;
  }

  if (!("voice" in member)) {
    await interaction.reply(t("voice:errors.noMemberVoice"));
    return null;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply(t("voice:errors.noMemberVoice"));
    return null;
  }

  const dvcRepo = db.em.getRepository(Dvc);

  if (!await dvcRepo.findOne({ channelId: voiceChannel.id })) {
    await interaction.reply(t("voice:errors.notDynamicChannel"));
    return null;
  }

  return voiceChannel;
}

const Command = new SlashCommandBuilder()
  .setName("dvc")
  .setDescription(t("voice:commands.dvc.description"))
  .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.name"))
  .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.description"))
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rename")
      .setDescription(t("voice:commands.dvc.rename.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.rename.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.rename.description"))
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription(t("voice:commands.dvc.rename.options.name.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.rename.options.name.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.rename.options.name.description"))
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const name = interaction.options.getString("name", true);
        await voiceChannel.setName(name, `@${interaction.user.username}: /dvc rename ${name}`).catch(() => {
          // failed to rename channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.rename.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.rename.success", { name }))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("lock")
      .setDescription(t("voice:commands.dvc.lock.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.lock.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.lock.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: false
        }, {
          reason: `@${interaction.user.username}: /dvc lock`,
          type: OverwriteType.Role
        }).catch(() => {
          // failed to lock channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.lock.failed"))
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.lock.success"))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unlock")
      .setDescription(t("voice:commands.dvc.unlock.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.unlock.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.unlock.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: true
        }, {
          reason: `@${interaction.user.username}: /dvc unlock`,
          type: OverwriteType.Role
        }).catch(() => {
          // failed to unlock channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.unlock.failed"))
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.unlock.success"))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("hide")
      .setDescription(t("voice:commands.dvc.hide.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.hide.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.hide.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: false
        }, {
          reason: `@${interaction.user.username}: /dvc hide`,
          type: OverwriteType.Role
        }).catch(() => {
          // failed to hide channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.hide.failed"))
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.hide.success"))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("show")
      .setDescription(t("voice:commands.dvc.show.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.show.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.show.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: true
        }, {
          reason: `@${interaction.user.username}: /dvc show`,
          type: OverwriteType.Role
        }).catch(() => {
          // failed to show channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.show.failed"))
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.show.success"))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription(t("voice:commands.dvc.add.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.description"))
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription(t("voice:commands.dvc.add.options.user.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.options.user.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.options.user.description"))
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription(t("voice:commands.dvc.add.options.role.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.options.role.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.add.options.role.description"))
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const user = interaction.options.getUser("user", true);
        const role = interaction.options.getRole("role", true);

        await voiceChannel.permissionOverwrites.create(user, {
          ViewChannel: true,
          Connect: true
        }, {
          reason: `@${interaction.user.username}: /dvc add user: @${user.username}`,
          type: OverwriteType.Member
        }).catch(() => {
          // failed to add user
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.add.failed"))
            ],
            ephemeral: true
          });
        });

        await voiceChannel.permissionOverwrites.create(role.id, {
          ViewChannel: true,
          Connect: true
        }, {
          reason: `@${interaction.user.username}: /dvc add role: @${role.name}`,
          type: OverwriteType.Role
        }).catch(() => {
          // failed to add role
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.add.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.add.success", {
                added: [
                  user.toString(),
                  role.toString()
                ]
                  .filter((a) => a)
                  .join(", ")
              }))
          ],
          ephemeral: true
        })
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("deny")
      .setDescription(t("voice:commands.dvc.deny.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.description"))
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription(t("voice:commands.dvc.deny.options.user.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.options.user.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.options.user.description"))
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription(t("voice:commands.dvc.deny.options.role.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.options.role.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.deny.options.role.description"))
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");

        user && await voiceChannel.permissionOverwrites.create(user, {
          ViewChannel: false,
          Connect: false
        }, {
          reason: `@${interaction.user.username}: /dvc deny user: @${user.username}`,
          type: OverwriteType.Member
        }).catch(() => {
          // failed to deny user
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.deny.failed"))
            ],
            ephemeral: true
          });
        });

        role && await voiceChannel.permissionOverwrites.create(role.id, {
          ViewChannel: false,
          Connect: false
        },
          {
            reason: `@${interaction.user.username}: /dvc deny role: @${role.name}`,
            type: OverwriteType.Role
          }
        ).catch(() => {
          // failed to deny role
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.deny.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.deny.success", {
                denied: [
                  user?.toString(),
                  role?.toString()
                ]
                  .filter((a) => a)
                  .join(", ")
              }))
          ],
          ephemeral: true
        })
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription(t("voice:commands.dvc.remove.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.description"))
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription(t("voice:commands.dvc.remove.options.user.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.options.user.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.options.user.description"))
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription(t("voice:commands.dvc.remove.options.role.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.options.role.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.remove.options.role.description"))
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");

        user && await voiceChannel.permissionOverwrites.delete(user, `@${interaction.user.username}: /dvc delete user: @${user.username}`).catch(() => {
          // failed to remove user
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.remove.failed"))
            ],
            ephemeral: true
          });
        });

        role && await voiceChannel.permissionOverwrites.delete(role.id, `@${interaction.user.username}: /dvc delete role: @${role.name}`).catch(() => {
          // failed to remove role
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.remove.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.remove.success", { user, role }))
          ],
          ephemeral: true
        })
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("freeze")
      .setDescription(t("voice:commands.dvc.freeze.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.freeze.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.freeze.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const members = voiceChannel.members.map((member) => member.user);
        await Promise.all(members.map((member) => {
          return voiceChannel.permissionOverwrites.create(member, {
            ViewChannel: true,
            Connect: true
          }, {
            reason: `@${interaction.user.username}: /dvc freeze`,
            type: OverwriteType.Member
          }).catch(() => {
            // failed to freeze user
            interaction.reply({
              embeds: [
                EmbedUtil.errorEmbed(interaction.guild)
                  .setDescription(t("voice:commands.dvc.freeze.failed"))
              ],
              ephemeral: true
            });
          });
        }))

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.freeze.success"))
          ],
          ephemeral: true
        });

      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("clear")
      .setDescription(t("voice:commands.dvc.clear.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.clear.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.clear.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.set([], `@${interaction.user.username}: /dvc clear`).catch(() => {
          // failed to clear permissions
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.clear.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.clear.success"))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("limit")
      .setDescription(t("voice:commands.dvc.limit.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.limit.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.limit.description"))
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription(t("voice:commands.dvc.limit.options.limit.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.limit.options.limit.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.limit.options.limit.description"))
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const limit = interaction.options.getInteger("limit", true);
        await voiceChannel.setUserLimit(limit, `@${interaction.user.username}: /dvc limit ${limit}`).catch(() => {
          // failed to set user limit
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.limit.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.limit.success", { limit }))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("bitrate")
      .setDescription(t("voice:commands.dvc.bitrate.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.bitrate.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.bitrate.description"))
      .addIntegerOption((option) =>
        option
          .setName("bitrate")
          .setDescription(t("voice:commands.dvc.bitrate.options.bitrate.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.bitrate.options.bitrate.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.bitrate.options.bitrate.description"))
          .setMinValue(8000)
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const bitrate = interaction.options.getInteger("bitrate", true);
        await voiceChannel.setBitrate(bitrate, `@${interaction.user.username}: /dvc bitrate ${bitrate}`).catch(() => {
          // failed to set bitrate
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.bitrate.failed"))
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.bitrate.success", { bitrate }))
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("info")
      .setDescription(t("voice:commands.dvc.info.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.info.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.info.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setTitle(voiceChannel.name)
              .setDescription(
                "```diff\n" +
                voiceChannel.permissionOverwrites.valueOf().map((v, k) => {
                  if (v.type == OverwriteType.Role && v.id == interaction.guild!.roles.everyone.id) {
                    return;
                  }

                  return [
                    v.type == OverwriteType.Member ? voiceChannel.guild.members.cache.get(k)?.user.tag : voiceChannel.guild.roles.cache.get(k)?.name,
                    v.allow.toArray().length > 0 && v.allow.toArray().map((a) => `+ ${a}`).join("\n"),
                    v.allow.toArray().length > 0 && v.deny.toArray().map((d) => `- ${d}`).join("\n")
                  ]
                    .filter((a) => a)
                    .join("\n")
                }).join('\n')
                + "```"
              )
              .setFields([
                {
                  name: t("voice:commands.dvc.info.fields.locked"),
                  value: `${voiceChannel.permissionOverwrites.cache.get(interaction.guild!.roles.everyone.id)?.deny.has("Connect") ? t("core:yes") : t("core:no")}`,
                  inline: true
                },
                {
                  name: t("voice:commands.dvc.info.fields.hidden"),
                  value: `${voiceChannel.permissionOverwrites.cache.get(interaction.guild!.roles.everyone.id)?.deny.has("ViewChannel") ? t("core:yes") : t("core:no")}`,
                  inline: true
                },
                {
                  name: t("voice:commands.dvc.info.fields.userLimit"),
                  value: `${voiceChannel.userLimit || 0}`,
                  inline: true
                },
                {
                  name: t("voice:commands.dvc.info.fields.bitrate"),
                  value: `${voiceChannel.bitrate / 1000} kbps`,
                  inline: true
                }
              ])
          ],
          ephemeral: true
        });
      })
  )

export default Command;

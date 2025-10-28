import { ChatInputCommandInteraction, embedLength, Guild, MessageFlags, OverwriteType, PermissionFlagsBits, VoiceBasedChannel } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import EmbedUtil from "../../util/util/embed.js";
import i18next, { t } from "i18next";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { db } from "../../../core/index.js";
import { Dvc } from "../entities/dvc.entity.js";

async function getVoiceChannelAndTFunction(interaction: ChatInputCommandInteraction): Promise<[VoiceBasedChannel | null, typeof t]> {

  const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

  const member = interaction.member;
  if (!member) {
    return [null, t];
  }

  if (!("voice" in member)) {
    await interaction.reply(t("voice:errors.noMemberVoice"));
    return [null, t];
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply(t("voice:errors.noMemberVoice"));
    return [null, t];
  }

  const dvcRepo = db.em.getRepository(Dvc);

  if (!await dvcRepo.findOne({ channelId: voiceChannel.id })) {
    await interaction.reply(t("voice:errors.notDynamicChannel"));
    return [null, t]
  }

  return [voiceChannel, t];
}

const Command = new SlashCommandBuilder()
  .setName("dvc")
  .setLanguageRoot("voice:commands.dvc")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rename")
      .addStringOption((option) =>
        option
          .setName("name")
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;
        await interaction.deferReply({
          flags: [MessageFlags.Ephemeral]
        })

        await Promise.all(([...(await Promise.all(voiceChannel.permissionOverwrites.cache.map(
          async (ov) => {
            const role = voiceChannel.guild.roles.cache.get(ov.id) || await voiceChannel.guild.roles.fetch(ov.id)
            if (ov.type == OverwriteType.Role && role &&
              !voiceChannel.permissionsFor(role)) {
              return async () => {
                await voiceChannel.permissionOverwrites.edit(ov.id, {
                  Connect: false
                })
              }
            }
          })
        )),
        async () => await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: false
        }, {
          reason: `@${interaction.user.username}: /dvc lock`,
          type: OverwriteType.Role
        })
        ] as (() => Promise<any>)[])
          .filter(Boolean)
          .map(f => f())
        ).catch(() => {
          // failed to lock channel
          interaction.editReply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.lock.failed"))
            ],
          });
        })

        await interaction.editReply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.lock.success"))
          ],
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unlock")
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

        // sync permissions (funny enough its called lock permissions lmfao)

        await voiceChannel.lockPermissions().catch(() => {
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
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

        await interaction.deferReply({
          flags: MessageFlags.Ephemeral
        })

        await Promise.all(([...(await Promise.all(voiceChannel.permissionOverwrites.cache.map(
          async (ov) => {
            const role = voiceChannel.guild.roles.cache.get(ov.id) || await voiceChannel.guild.roles.fetch(ov.id)
            if (ov.type == OverwriteType.Role && role &&
              !voiceChannel.permissionsFor(role)) {
              return async () => {
                await voiceChannel.permissionOverwrites.edit(ov.id, {
                  ViewChannel: false
                })
              }
            }
          })
        )),
        async () => await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: false
        }, {
          reason: `@${interaction.user.username}: /dvc lock`,
          type: OverwriteType.Role
        })
        ] as (() => Promise<any>)[])
          .filter(Boolean)
          .map(f => f())
        ).catch(() => {
          // failed to hide channel
          interaction.editReply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.hide.failed"))
            ],
          });
        })

        await interaction.editReply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(t("voice:commands.dvc.hide.success"))
          ],
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("show")
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

        await voiceChannel.lockPermissions().catch(() => {
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
      .addUserOption((option) =>
        option
          .setName("user")
      )
      .addRoleOption((option) =>
        option
          .setName("role")
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .addUserOption((option) =>
        option
          .setName("user")
      )
      .addRoleOption((option) =>
        option
          .setName("role")
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .addUserOption((option) =>
        option
          .setName("user")
      )
      .addRoleOption((option) =>
        option
          .setName("role")
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .addIntegerOption((option) =>
        option
          .setName("bitrate")
          .setMinValue(8000)
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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
      .setFunction(async (interaction) => {
        const [voiceChannel, t] = await getVoiceChannelAndTFunction(interaction);
        if (!voiceChannel) return;

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

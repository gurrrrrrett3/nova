import i18next, { t } from "i18next";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { ChannelType, PermissionFlagsBits } from "discord.js";
import { db } from "../../../core/index.js";
import { LogChannel, LogChannelType } from "../entities/logChannel.entity.js";
import EmbedUtil from "../../util/util/embed.js";

const Command = new SlashCommandBuilder()
  .setName("logadmin")
  .setDescription(t("logging:commands.logadmin.description"))
  .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.name"))
  .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.description"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false)
  .addSubcommandGroup((group) =>
    group
      .setName("channels")
      .setDescription(t("logging:commands.logadmin.channels.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.description"))
      .addSubcommand((subcommand) =>
        subcommand
          .setName("messagelogging")
          .setDescription(t("logging:commands.logadmin.channels.messagelogging.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.messagelogging.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.messagelogging.description"))
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription(t("logging:commands.logadmin.channels.messagelogging.options.channel.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.messagelogging.options.channel.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.messagelogging.options.channel.description"))
              .addChannelTypes(ChannelType.GuildText)
          )
          .setFunction(async (interaction) => {
            const channel = interaction.options.getChannel("channel") || interaction.channel;
            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            let logChannel = await logChannelRepo.findOne({
              guildId: interaction.guildId,
              type: LogChannelType.Message,
            });

            if (!logChannel) {
              logChannel = logChannelRepo.create({
                guildId: interaction.guildId!,
                channelId: channel!.id,
                type: LogChannelType.Message,
              });
            }

            logChannel.channelId = channel!.id;
            await db.em.persistAndFlush(logChannel);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild)
                  .setDescription(t("logging:commands.logadmin.channels.messagelogging.success", { channel: channel!.toString() }))
              ]
            })
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("memberlogging")
          .setDescription(t("logging:commands.logadmin.channels.memberlogging.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.memberlogging.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.memberlogging.description"))
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription(t("logging:commands.logadmin.channels.memberlogging.options.channel.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.memberlogging.options.channel.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("logging:commands.logadmin.channels.memberlogging.options.channel.description"))
              .addChannelTypes(ChannelType.GuildText)
          )
          .setFunction(async (interaction) => {
            const channel = interaction.options.getChannel("channel") || interaction.channel;
            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            let logChannel = await logChannelRepo.findOne({
              guildId: interaction.guildId,
              type: LogChannelType.Member,
            });

            if (!logChannel) {
              logChannel = logChannelRepo.create({
                guildId: interaction.guildId!,
                channelId: channel!.id,
                type: LogChannelType.Member,
              });
            }

            logChannel.channelId = channel!.id;
            await db.em.persistAndFlush(logChannel);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild)
                  .setDescription(t("logging:commands.logadmin.channels.memberlogging.success", { channel: channel!.toString() }))
              ]
            })
          })
      )
  )
export default Command;

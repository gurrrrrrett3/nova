import { ChatInputCommandInteraction } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import VoiceModule from "../index.js";
import EmbedUtil from "../../util/util/embed.js";
import i18next from "i18next";
import LanguageLoader from "../../../core/loaders/languageLoader.js";

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

  if (!VoiceModule.getVoiceModule().voiceChannels.has(voiceChannel.id)) {
    await interaction.reply(t("voice:errors.notDynamicChannel"));
    return null;
  }

  return voiceChannel;
}

const Command = new SlashCommandBuilder()
  .setName("dvc")
  .setDescription("Manage your dynamic voice channel.")
  .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.name"))
  .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.description"))
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rename")
      .setDescription("Rename your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.rename.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.rename.description"))
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new name for your voice channel.")
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.rename.options.name.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.rename.options.name.description"))
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        const name = interaction.options.getString("name", true);
        await voiceChannel.setName(name).catch(() => {
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
      .setDescription("Lock your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.lock.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.lock.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: false
        }).catch(() => {
          // failed to lock channel
          interaction.reply({
            embeds: [
              EmbedUtil.errorEmbed(interaction.guild)
                .setDescription(t("voice:commands.dvc.lock.failed"))
            ],
            ephemeral: true
          });
        });

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
      .setDescription("Unlock your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.unlock.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.unlock.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: true
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
      .setDescription("Hide your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.hide.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.hide.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: false
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
      .setDescription("Show your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.show.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.show.description"))
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: true
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
      .setName("limit")
      .setDescription("Limit the number of users in your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.limit.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.limit.description"))
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription("The user limit for your voice channel.")
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.limit.options.limit.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.limit.options.limit.description"))
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
        await voiceChannel.setUserLimit(limit).catch(() => {
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
      .setDescription("Set the bitrate for your voice channel.")
      .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.bitrate.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.bitrate.description"))
      .addIntegerOption((option) =>
        option
          .setName("bitrate")
          .setDescription("The bitrate for your voice channel.")
          .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.bitrate.options.bitrate.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.dvc.subcommands.bitrate.options.bitrate.description"))
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
        await voiceChannel.setBitrate(bitrate).catch(() => {
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

export default Command;

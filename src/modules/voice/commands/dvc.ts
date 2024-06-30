import { ChatInputCommandInteraction } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import VoiceModule from "../index.js";
import EmbedUtil from "../../util/util/embed.js";

async function getVoiceChannel(interaction: ChatInputCommandInteraction) {
  const member = interaction.member;
  if (!member) {
    return null;
  }

  if (!("voice" in member)) {
    await interaction.reply("You must be in a voice channel to use this command.");
    return null;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply("You must be in a voice channel to use this command.");
    return null;
  }

  if (!VoiceModule.getVoiceModule().voiceChannels.has(voiceChannel.id)) {
    await interaction.reply("You must be in a dynamic voice channel to use this command.");
    return null;
  }

  return voiceChannel;
}

const Command = new SlashCommandBuilder()
  .setName("dvc")
  .setDescription("Manage your dynamic voice channel.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rename")
      .setDescription("Rename your voice channel.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new name for your voice channel.")
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const name = interaction.options.getString("name", true);
        await voiceChannel.setName(name).catch(() => {
          // failed to rename channel
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to rename voice channel.")
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(`Renamed voice channel to ${name}`)
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("lock")
      .setDescription("Lock your voice channel.")
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: false
        }).catch(() => {
          // failed to lock channel
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to lock voice channel.")
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription("Voice channel locked.")
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unlock")
      .setDescription("Unlock your voice channel.")
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          Connect: true
        }).catch(() => {
          // failed to unlock channel
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to unlock voice channel.")
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription("Voice channel unlocked.")
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("hide")
      .setDescription("Hide your voice channel.")
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: false
        }).catch(() => {
          // failed to hide channel
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to hide voice channel.")
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription("Voice channel hidden.")
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("show")
      .setDescription("Show your voice channel.")
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        await voiceChannel.permissionOverwrites.create(interaction.guild!.roles.everyone, {
          ViewChannel: true
        }).catch(() => {
          // failed to show channel
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to show voice channel.")
            ],
            ephemeral: true
          });
        })

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription("Voice channel shown.")
          ],
          ephemeral: true
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("limit")
      .setDescription("Limit the number of users in your voice channel.")
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription("The user limit for your voice channel.")
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true)
      )
      .setFunction(async (interaction) => {
        const voiceChannel = await getVoiceChannel(interaction);
        if (!voiceChannel) {
          return;
        }

        const limit = interaction.options.getInteger("limit", true);
        await voiceChannel.setUserLimit(limit).catch(() => {
          // failed to set user limit
          interaction.reply({
            embeds: [
              EmbedUtil.baseEmbed(interaction.guild)
                .setDescription("Failed to set user limit.")
            ],
            ephemeral: true
          });
        });

        await interaction.reply({
          embeds: [
            EmbedUtil.baseEmbed(interaction.guild)
              .setDescription(`Set user limit to ${limit}`)
          ],
          ephemeral: true
        });
      })
  );



export default Command;

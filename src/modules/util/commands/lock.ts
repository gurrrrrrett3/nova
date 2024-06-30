import { ChannelType, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { bot } from "../../../core/index.js";
import i18next from "i18next";
import EmbedUtil from "../util/embed.js";

const Command = new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock/unlock this channel.")
    .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to lock/unlock.")
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.channel.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.channel.description"))
            .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("The reason for locking/unlocking the channel.")
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.reason.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.reason.description"))
    )
    .setFunction(async (interaction) => {
        const partialChannel = interaction.options.getChannel("channel") || interaction.channel;
        const reason = interaction.options.getString("reason");

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        if (!partialChannel) return interaction.reply(t("util:error.noChannel"));

        const channel = bot.client.channels.resolve(partialChannel.id);

        if (!channel) return interaction.reply(t("util:error.noChannel"));

        if (!channel.isTextBased() || channel.type != ChannelType.GuildText) return interaction.reply(t("util:error.notTextChannel"));

        if (channel.permissionOverwrites.cache.has(interaction.guildId!)) {

            // channel is locked, unlock it

            await channel.permissionOverwrites.edit(interaction.guildId!, {
                SendMessages: null
            }, {
                reason: reason || t("util:commands.lock.defaultReason")
            });

            await interaction.reply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.lock.unlock.title"))
                        .setDescription(t("util:commands.lock.unlock.success", { channel: channel.toString() }))

                ]
            })
        } else {

            // channel is unlocked, lock it

            await channel.permissionOverwrites.create(interaction.guildId!, {
                SendMessages: false
            }, {
                reason: reason || "No reason provided."
            });

            await interaction.reply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.lock.lock.title"))
                        .setDescription(t("util:commands.lock.lock.success", { channel: channel.toString() }))

                ]
            })
        }
    });

export default Command;
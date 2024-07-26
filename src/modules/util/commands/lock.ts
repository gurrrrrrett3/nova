import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { bot } from "../../../core/index.js";
import i18next, { t } from "i18next";
import EmbedUtil from "../util/embed.js";

const Command = new SlashCommandBuilder()
    .setName("lock")
    .setDescription(t("util:commands.lock.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription(t("util:commands.lock.options.channel.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.channel.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.channel.description"))
            .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription(t("util:commands.lock.options.reason.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.reason.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.reason.description"))
    )
    .addBooleanOption((option) =>
        option
            .setName("showmessage")
            .setDescription(t("util:commands.lock.options.showmessage.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.showmessage.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.showmessage.description"))
    )
    .addBooleanOption((option) =>
        option
            .setName("hide")
            .setDescription(t("util:commands.lock.options.hide.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.hide.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.lock.options.hide.description"))
    )
    .setFunction(async (interaction) => {
        const partialChannel = interaction.options.getChannel("channel") || interaction.channel;
        const reason = interaction.options.getString("reason");
        const showmessage = interaction.options.getBoolean("showmessage") || true;
        const hide = interaction.options.getBoolean("hide") || false;

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        if (!partialChannel) return interaction.reply(t("util:error.noChannel"));

        const channel = bot.client.channels.resolve(partialChannel.id);

        if (!channel) return interaction.reply(t("util:error.noChannel"));

        if (!channel.isTextBased() || channel.type != ChannelType.GuildText) return interaction.reply(t("util:error.notTextChannel"));

        if (channel.permissionOverwrites.cache.has(interaction.guildId!)) {

            // channel is locked, unlock it

            await channel.permissionOverwrites.edit(interaction.guildId!, {
                SendMessages: null,
                ViewChannel: channel.parent ? channel.parent.permissionsFor(interaction.guildId!)?.has(PermissionsBitField.Flags.ViewChannel) : true
            }, {
                reason: reason || t("util:commands.lock.defaultReason")
            });

            await interaction.reply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.lock.unlock.title"))
                        .setDescription(t("util:commands.lock.unlock.success", { channel: channel.toString() }))
                ],
                ephemeral: !showmessage
            })
        } else {

            // channel is unlocked, lock it

            await channel.permissionOverwrites.create(interaction.guildId!, {
                SendMessages: false,
                ViewChannel: hide ? false : undefined
            }, {
                reason: reason || "No reason provided."
            });

            await interaction.reply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.lock.lock.title"))
                        .setDescription(t("util:commands.lock.lock.success", { channel: channel.toString() }))
                ],
                ephemeral: !showmessage
            })
        }
    });

export default Command;
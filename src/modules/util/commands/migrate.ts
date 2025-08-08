import { ChannelType, Colors, PermissionFlagsBits, VoiceBasedChannel } from "discord.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import i18next, { t } from "i18next";
import EmbedUtil from "../util/embed.js";

const Command = new SlashCommandBuilder()
    .setName("migrate")
    .setDescription(t("util:commands.migrate.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false)
    .addChannelOption((option) =>
        option
            .setName("from")
            .setDescription(t("util:commands.migrate.options.from.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.from.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.from.description"))
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName("to")
            .setDescription(t("util:commands.migrate.options.to.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.to.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.to.description"))
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription(t("util:commands.migrate.options.reason.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.reason.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.reason.description"))
    )
    .addBooleanOption((option) =>
        option
            .setName("permissions")
            .setDescription(t("util:commands.migrate.options.permissions.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.permissions.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.permissions.description"))
    )
    .addBooleanOption((option) =>
        option
            .setName("silent")
            .setDescription(t("util:commands.migrate.options.silent.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.silent.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("util:commands.migrate.options.silent.description"))
            .setRequired(false)
    )
    .setFunction(async (interaction) => {
        const fromChannel = interaction.options.getChannel<ChannelType.GuildVoice | ChannelType.GuildStageVoice>("from", true)
        const toChannel = interaction.options.getChannel<ChannelType.GuildVoice | ChannelType.GuildStageVoice>("to", true);
        const reason = interaction.options.getString("reason");
        const permissions = interaction.options.getBoolean("permissions") || false;
        const silent = interaction.options.getBoolean("silent") || false;

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        if (!fromChannel.isVoiceBased() || !toChannel.isVoiceBased()) return interaction.reply(t("util:error.notVoiceChannel"));

        if (fromChannel.members.size == 0) return interaction.reply(t("util:error.noMembers"));
        if (fromChannel.id == toChannel.id) return interaction.reply(t("util:error.sameChannels"));
        if (fromChannel.members.size > 99) return interaction.reply(t("util:error.tooManyMembers"));
        if (toChannel.userLimit != 0 && fromChannel.members.size > toChannel.userLimit) return interaction.reply(t("util:error.tooManyMembersInChannel", { channel: toChannel.toString(), limit: toChannel.userLimit, members: fromChannel.members.size }));

        await interaction.deferReply();

        await interaction.editReply({
            embeds: [
                EmbedUtil.baseEmbed(interaction.guild)
                    .setTitle(t("util:commands.migrate.migrating.title"))
                    .setDescription(t("util:commands.migrate.migrating.description", { from: fromChannel.toString(), to: toChannel.toString() }))
                    .setColor(Colors.Yellow)
            ]
        });

        const failedToMoveList: string[] = [];
        const movedList: string[] = [];

        await Promise.all(
            fromChannel.members.map(async (member) => {
                if (member.voice.channelId == toChannel.id) return;

                // if permissions is true, check if the user has permission to join the channel
                if (permissions) {
                    const permissions = toChannel.permissionsFor(member);
                    if (!permissions.has(PermissionFlagsBits.Connect)) {
                        failedToMoveList.push(member.user.toString());
                        return;
                    }
                }

                await member.voice.setChannel(toChannel,
                    `Migrate: ${reason}` || t("util:commands.migrate.defaultReason", { from: fromChannel.toString(), to: toChannel.toString() }))
                    .catch(() => {
                        failedToMoveList.push(member.user.toString());
                    })
                    .then(async () => {
                        if (silent) return;
                        // try to dm the user
                        const dmChannel = await member.createDM();
                        await dmChannel.send({
                            embeds: [
                                EmbedUtil.baseEmbed(interaction.guild)
                                    .setTitle(t("util:commands.migrate.dm.title"))
                                    .setDescription(t("util:commands.migrate.dm.description", { from: fromChannel.toString(), to: toChannel.toString(), user: interaction.user.toString() }))
                                    .addFields({
                                        name: t("util:commands.migrate.dm.reason"),
                                        value: reason || t("util:commands.migrate.defaultReason", { from: fromChannel.toString(), to: toChannel.toString() })
                                    })
                                    .setColor(Colors.Green)
                            ]
                        })
                            .catch(() => {
                                // do nothing
                            });
                    }).finally(() => {
                        movedList.push(member.user.toString());
                    })
            })
        )

        if (failedToMoveList.length > 0) {
            return interaction.editReply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.migrate.failed.title"))
                        .setDescription(t("util:commands.migrate.failed.description", { from: fromChannel.name, to: toChannel.name, amount: failedToMoveList.length }))
                        .addFields({
                            name: t("util:commands.migrate.failed.members"),
                            value: failedToMoveList.join(", ") || t("util:commands.migrate.success.noMembers")
                        })
                        .setColor(Colors.Red)
                ]
            });
        } else {
            return interaction.editReply({
                embeds: [
                    EmbedUtil.baseEmbed(interaction.guild)
                        .setTitle(t("util:commands.migrate.success.title"))
                        .setDescription(t("util:commands.migrate.success.description", { from: fromChannel.name, to: toChannel.name, moved: movedList.length }))
                        .addFields({
                            name: t("util:commands.migrate.success.members"),
                            value: movedList.join(", ") || t("util:commands.migrate.success.noMembers")
                        })
                        .setColor(Colors.Green)
                ]
            });
        }
    })

export default Command;
import { ChannelType, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { db } from "../../../core/index.js";
import { DvcChannel } from "../entities/dvcChannel.entity.js";
import EmbedUtil from "../../util/util/embed.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import { t } from "i18next";

const Command = new SlashCommandBuilder()
    .setName("vcadmin")
    .setDescription(t("voice:commands.vcadmin.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommandGroup((group) =>
        group
            .setName("dvc")
            .setDescription(t("voice:commands.vcadmin.dvc.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.description"))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("setlobby")
                    .setDescription(t("voice:commands.vcadmin.dvc.setlobby.description"))
                    .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.setlobby.name"))
                    .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.setlobby.description"))
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription(t("voice:commands.vcadmin.dvc.setlobby.options.channel.description"))
                            .setNameLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.setlobby.options.channel.name"))
                            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("voice:commands.vcadmin.dvc.setlobby.options.channel.description"))
                            .setRequired(true)
                            .addChannelTypes(ChannelType.GuildVoice)
                    )
                    .setFunction(async (interaction) => {
                        const channel = interaction.options.getChannel("channel", true);
                        const dvcChannelRepo = db.em.getRepository(DvcChannel);

                        let dvcChannel = await dvcChannelRepo.findOne({
                            guildId: interaction.guildId
                        });

                        if (!dvcChannel) {
                            dvcChannel = dvcChannelRepo.create({
                                guildId: interaction.guildId!,
                                channelId: channel.id
                            });
                        }

                        dvcChannel.channelId = channel.id;

                        await db.em.persistAndFlush(dvcChannel);

                        await interaction.reply({
                            embeds: [
                                EmbedUtil.baseEmbed(interaction.guild)
                                    .setDescription(t("voice:commands.vcadmin.dvc.setlobby.success", { channel: channel.toString() }))
                            ],
                        });
                    })
            )
    )

export default Command;
import { ChannelType, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { db } from "../../../core/index.js";
import { DvcChannel } from "../entities/dvcChannel.entity.js";
import EmbedUtil from "../../util/util/embed.js";

const Command = new SlashCommandBuilder()
    .setName("vcadmin")
    .setDescription("Manage voice channel settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommandGroup((group) =>
        group
            .setName("dvc")
            .setDescription("Manage dynamic voice channels.")
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("setlobby")
                    .setDescription("Set the lobby channel for dynamic voice channels.")
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("The channel to set as the lobby.")
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
                                    .setDescription(`Set lobby channel to <#${channel.id}>`)
                            ],
                        });
                    })
            )
    )

export default Command;
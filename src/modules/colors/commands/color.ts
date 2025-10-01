import { MessageFlags, PermissionFlagsBits, Role } from "discord.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { t } from "i18next";
import { colors } from "../colors.js";
import ColorsModule from "../index.js";
import EmbedUtil from "../../util/util/embed.js";

const Command = new SlashCommandBuilder()
    .setName("color")
    .setLanguageRoot("colors:commands.color")
    .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
    .setDMPermission(false)
    .addStringOption(option =>
        option
            .setName("color")
            .setRequired(true)
            .setAutocomplete(async (interaction, text) => {
                const validColors = Object.keys(colors).filter((c) => c.startsWith(text.toLowerCase())).slice(0, 25)
                return validColors.map((name) => ({
                    name,
                    value: name
                }))
            })
    )
    .setFunction(async (interaction) => {
        const color = interaction.options.getString("color", true)
        const colorHex = colors[color.toLowerCase() as keyof typeof colors]
        const hexRegex = /^#([A-Fa-f0-9]{6})$/;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        })

        let res: Role | undefined

        if (hexRegex.test(color)) {
            res = await ColorsModule.assignRole(interaction.guild!, interaction.member!.user.id, color as `#${string}`, color)
        } else if (colorHex) {
            res = await ColorsModule.assignRole(interaction.guild!, interaction.member!.user.id, colorHex as `#${string}`, color)
        } else {
            await interaction.editReply({
                embeds: [
                    EmbedUtil.errorEmbed(interaction.guild)
                        .setTitle("Error")
                        .setDescription(t("colors:error.colorNotFound", { color }))
                ]
            })
            return
        }

        await interaction.editReply({
            embeds: [
                EmbedUtil.successEmbed(interaction.guild)
                    .setTitle("Success")
                    .setDescription(t("colors:success.colorAssigned", { color: res!.toString() }))
            ]
        })
    })

export default Command;
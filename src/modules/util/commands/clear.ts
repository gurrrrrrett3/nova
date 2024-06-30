import { ChannelType, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import EmbedUtil from "../util/embed.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import i18next from "i18next";

const Command = new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the chat of the specified amount of messages.")
    .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("The amount of messages to clear.")
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.options.amount.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.options.amount.description"))
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The user to clear messages from.")
            .setNameLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.options.user.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("util:commands.clear.options.user.description"))
            .setRequired(false)
    )
    .setFunction(async (interaction) => {
        const amount = interaction.options.getInteger("amount", true);
        const user = interaction.options.getUser("user");
        const channel = interaction.channel!;

        const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

        let clearedAmount = 0;

        // type checking
        if (channel.type == ChannelType.DM) return interaction.reply(t("util:error.dmChannel"));

        if (user) {
            const messages = await channel.messages.fetch({ limit: amount });
            const userMessages = messages.filter((msg) => msg.author.id === user.id);
            clearedAmount = userMessages.size;
            await channel.bulkDelete(userMessages)
        } else {
            clearedAmount = amount;
            await channel.bulkDelete(amount)
        }

        await interaction.reply({
            embeds: [
                clearedAmount > 0 ? EmbedUtil.baseEmbed()
                    .setTitle(t("util:commands.clear.title"))
                    .setDescription(t("util:commands.clear.success", { amount: clearedAmount })) :
                    EmbedUtil.errorEmbed()
                        .setTitle(t("util:commands.clear.title"))
                        .setDescription(t("util:commands.clear.noMessages"))
            ]
        })
    });

export default Command;
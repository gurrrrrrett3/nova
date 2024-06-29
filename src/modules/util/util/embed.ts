import { Colors, EmbedBuilder, Guild } from "discord.js";

export default class EmbedUtil {
    public static baseEmbed(guild?: Guild | null) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setFooter({
                text: "Powered by Nova",
            })
            .setTimestamp();

        if (guild) {
            embed.setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            });
        }

        return embed;
    }
}
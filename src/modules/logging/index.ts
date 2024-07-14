import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { LogChannel, LogChannelType } from "./entities/logChannel.entity.js";
import EmbedUtil from "../util/util/embed.js";
import DiffUtil from "../util/util/diff.js";
import TimeUtil from "../util/util/time.js";
import i18next from "i18next";

export default class LoggingModule extends Module {

    constructor() {
        super({
            name: "logging",
            description: "No description provided>",
        });
    }

    override async onLoad(): Promise<boolean> {

        bot.client.on("messageUpdate", async (oldMessage, newMessage) => {
            if (oldMessage.content === newMessage.content) return;

            const t = await i18next.changeLanguage(newMessage.guild?.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            const logChannel = await logChannelRepo.findOne({
                guildId: newMessage.guild!.id,
                type: LogChannelType.Message
            });

            if (!logChannel) return;

            const channel = newMessage.guild!.channels.cache.get(logChannel.channelId) || await newMessage.guild!.channels.fetch(logChannel.channelId);
            if (!channel || !channel.isTextBased()) {
                db.em.remove(logChannel);
                return;
            }

            const embed = EmbedUtil.baseEmbed(newMessage.guild)
                .setTitle(t("logging:events.messageUpdate.title"))
                .setDescription([
                    t("logging:events.messageUpdate.description", { user: `<@${newMessage.author?.id}>`, channel: `<#${newMessage.channel.id}>` }),
                    `\`\`\`ansi\n${DiffUtil.formattedDiff(oldMessage.content || "", newMessage.content || "")}\`\`\``
                ].join("\n"))
                .setTimestamp();

            await channel.send({ embeds: [embed] });

        })

        bot.client.on("messageDelete", async (message) => {

            const t = await i18next.changeLanguage(message.guild?.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            const logChannel = await logChannelRepo.findOne({
                guildId: message.guild!.id,
                type: LogChannelType.Message
            });

            if (!logChannel) return;

            const channel = message.guild!.channels.cache.get(logChannel.channelId) || await message.guild!.channels.fetch(logChannel.channelId);
            if (!channel || !channel.isTextBased()) {
                db.em.remove(logChannel);
                return;
            }

            const embed = EmbedUtil.baseEmbed(message.guild)
                .setTitle(t("logging:events.messageDelete.title"))
                .setDescription([
                    t("logging:events.messageDelete.description", { user: `<@${message.author?.id}>`, channel: `<#${message.channel.id}>` }),
                    `\`\`\`ansi\n${message.content}\`\`\``
                ].join("\n"))
                .setTimestamp();

            await channel.send({ embeds: [embed] });

        })

        bot.client.on("guildMemberAdd", async (member) => {

            const t = await i18next.changeLanguage(member.guild.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            const logChannel = await logChannelRepo.findOne({
                guildId: member.guild.id,
                type: LogChannelType.Member
            });

            if (!logChannel) return;

            const channel = member.guild.channels.cache.get(logChannel.channelId) || await member.guild.channels.fetch(logChannel.channelId);
            if (!channel || !channel.isTextBased()) {
                db.em.remove(logChannel);
                return;
            }

            const embed = EmbedUtil.baseEmbed(member.guild)
                .setTitle(t("logging:events.guildMemberAdd.title"))
                .setDescription(t("logging:events.guildMemberAdd.description", {
                    user: `<@${member.id}>`,
                    created: `${TimeUtil.discordTimestamp(member.user.createdAt, "longDateTime")} (${TimeUtil.discordTimestamp(member.user.createdAt, "relative")})`
                }))
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        })

        bot.client.on("guildMemberRemove", async (member) => {

            const t = await i18next.changeLanguage(member.guild.preferredLocale || "en-US");

            const logChannelRepo = db.em.getRepository(LogChannel);
            const logChannel = await logChannelRepo.findOne({
                guildId: member.guild.id,
                type: LogChannelType.Member
            });

            if (!logChannel) return;

            const channel = member.guild.channels.cache.get(logChannel.channelId) || await member.guild.channels.fetch(logChannel.channelId);

            if (!channel || !channel.isTextBased()) {
                db.em.remove(logChannel);
                return;
            }

            const embed = EmbedUtil.baseEmbed(member.guild)
                .setTitle(t("logging:events.guildMemberRemove.title"))
                .setDescription(t("logging:events.guildMemberRemove.description", {
                    user: `<@${member.id}>`,
                    created: `${TimeUtil.discordTimestamp(member.user.createdAt, "longDateTime")} (${TimeUtil.discordTimestamp(member.user.createdAt, "relative")})`,
                    joined: `${TimeUtil.discordTimestamp(member.joinedAt!, "longDateTime")} (${TimeUtil.discordTimestamp(member.joinedAt!, "relative")})`
                }))
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        })

        return true;
    }

    public static getLoggingModule(): LoggingModule {
        return bot.moduleLoader.getModule("logging") as LoggingModule;
    }

}
import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { DvcLobby } from "./entities/dvcLobby.entity.js";
import { ChannelType } from "discord.js";
import { Dvc } from "./entities/dvc.entity.js";
import EmbedUtil from "../util/util/embed.js";
import i18next, { t } from "i18next";

export default class VoiceModule extends Module {

    constructor() {
        super({
            name: "voice",
            description: "No description provided>",
        });
    }

    override async onLoad(): Promise<boolean> {

        const dvcRepo = db.em.getRepository(Dvc)
        const dvcLobbyRepo = db.em.getRepository(DvcLobby)

        const dvcs = await dvcRepo.findAll()

        await Promise.all(dvcs.map(async (dvc) => {
            const channel = await bot.client.channels.fetch(dvc.channelId).catch(() => null)

            if (channel && channel.type == ChannelType.GuildVoice) {
                if (channel.members.size === 0) {
                    await channel.delete()

                    db.em.remove(dvc)
                    return;
                }
            }
        }))

        bot.client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId == newState.channelId) return;
            const t = await i18next.changeLanguage(newState.guild?.preferredLocale || "en-US");

            const dvc = await dvcRepo.findOne({
                channelId: oldState.channelId
            })

            if (oldState.channel && dvc && oldState.channel.members.size === 0) {

                // dvc channel is empty

                await Promise.all([
                    db.em.removeAndFlush(dvc),
                    oldState.channel.delete()
                ])

            }

            if (newState.channel && newState.member) {

                const dvcChannel = await dvcLobbyRepo.findOne({
                    channelId: newState.channel.id
                })

                if (dvcChannel) {
                    // create new dvc channel

                    const category = newState.channel.parent;
                    if (!category) {
                        return;
                    }

                    const newChannel = await newState.guild.channels.create({
                        name: newState.member!.displayName + "'s Channel",
                        type: ChannelType.GuildVoice,
                        parent: category,
                    }).catch(() => {
                        // can't create channel
                        this.logger.error(`Can't create channel.`);
                    });

                    if (!newChannel) {
                        return;
                    }

                    await newState.member.voice.setChannel(newChannel).catch(() => {
                        // can't move member
                        this.logger.error(`Can't move member to new channel.`);
                    });

                    await newChannel.send({
                        embeds: [
                            EmbedUtil.baseEmbed(newState.guild)
                                .setTitle(t("voice:messages.created.title"))
                                .setDescription(t("voice:messages.created.description"))

                        ]
                    }).catch(() => {
                        // can't send message
                        this.logger.error(`Can't send message.`);
                    })

                    const dvc = dvcRepo.create({
                        channelId: newChannel.id
                    })

                    await db.em.persistAndFlush(dvc)

                    return;
                }
            }
        })

        return true;
    }


    public static getVoiceModule(): VoiceModule {
        return bot.moduleLoader.getModule("voice") as VoiceModule;
    }

}
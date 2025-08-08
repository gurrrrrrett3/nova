import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { DvcLobby } from "./entities/dvcLobby.entity.js";
import { ChannelType } from "discord.js";
import { Dvc } from "./entities/dvc.entity.js";
import EmbedUtil from "../util/util/embed.js";
import i18next, { t } from "i18next";
import { GuildConfig } from "../core/entities/demoEntity.js";

export default class VoiceModule extends Module {

    constructor() {
        super({
            name: "voice",
            description: "No description provided>",
        });
    }

    public static babyShakeCache: Record<string, {
        sourceChannelId: string,
        viewableChannelIds: string[],
        nextTargetChannelId: string,
        timeLeft: number,
        timer: NodeJS.Timeout
    }> = {}

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
            await Promise.all([
                // dvc
                new Promise(async (resolve) => {
                    if (oldState.channelId == newState.channelId) return;
                    const t = await i18next.changeLanguage(newState.guild?.preferredLocale || "en-US");

                    const dvc = oldState && await dvcRepo.findOne({
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
                                name: newState.member!.displayName.endsWith("s") ? newState.member!.displayName + "' channel" : newState.member!.displayName + "'s channel",
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
                        }
                    }
                    resolve(true);
                }),
                // auto afk on deafen
                new Promise(async (resolve) => {
                    if (!newState.channel) return;
                    if (oldState.deaf == newState.deaf && oldState.selfDeaf == newState.selfDeaf) return;
                    const guildConfigRepo = db.em.getRepository(GuildConfig);
                    const autoAfkOnDeafen = await guildConfigRepo.findOne({
                        guildId: newState.guild.id,
                        key: "autoafk.ondeafen"
                    }).then((config) => {
                        if (config) {
                            return config.value === "true";
                        }
                        return false;
                    })

                    if (autoAfkOnDeafen && newState.deaf && newState.selfDeaf) {
                        const guild = newState.guild;
                        const afkChannel = guild.afkChannelId;

                        if (afkChannel) {
                            const channel = await guild.channels.fetch(afkChannel).catch(() => null);
                            if (channel && newState.member && channel.type == ChannelType.GuildVoice) {
                                await newState.member.voice.setChannel(channel).catch(() => {
                                    // can't move member
                                    this.logger.error(`Can't move member to afk channel.`);
                                });
                            }
                        }

                    }
                }),
                // babyshake
                new Promise(async (resolve) => {
                    if (oldState.channelId == newState.channelId) return;
                    const cache = VoiceModule.babyShakeCache[newState.id];
                    if (!cache) return;

                    if (newState.channelId == cache.sourceChannelId || newState.channelId != cache.nextTargetChannelId) {
                        // member moved to source or next target channel, reset timer
                        clearInterval(cache.timer);
                        delete VoiceModule.babyShakeCache[newState.id];
                        return;
                    }
                    resolve(true);
                })
            ])
        })

        return true;
    }


    public static getVoiceModule(): VoiceModule {
        return bot.moduleLoader.getModule("voice") as VoiceModule;
    }

}
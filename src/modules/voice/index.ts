import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { DvcLobby } from "./entities/dvcLobby.entity.js";
import { ChannelType } from "discord.js";
import { Dvc } from "./entities/dvc.entity.js";

export default class VoiceModule extends Module {

    constructor() {
        super({
            name: "voice",
            description: "No description provided>",
        });
    }

    public voiceChannels: Map<string, Dvc> = new Map();

    override async onLoad(): Promise<boolean> {

        const dvcRepo = db.em.getRepository(Dvc)
        const dvcLobbyRepo = db.em.getRepository(DvcLobby)

        const dvcs = await dvcRepo.findAll()

        await Promise.all(dvcs.map(async (dvc) => {
            const channel = await bot.client.channels.fetch(dvc.channelId)
            if (channel && channel.type == ChannelType.GuildVoice) {
                if (channel.members.size === 0) {
                    await channel.delete()

                    db.em.remove(dvc)
                    return;
                }

                this.voiceChannels.set(
                    channel.id,
                    dvcRepo.create({
                        channelId: channel.id
                    }))
            }
        }))

        db.em.flush()
        this.logger.info(`Loaded ${this.voiceChannels.size} voice channels.`)

        bot.client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId == newState.channelId) return;
            if (oldState.channel && this.voiceChannels.has(oldState.channel.id) && oldState.channel.members.size === 0) {

                // dvc channel is empty
                this.voiceChannels.delete(oldState.channel.id)

                await Promise.all([
                    db.em.removeAndFlush(this.voiceChannels.get(oldState.channel.id)!),
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

                    const dvc = dvcRepo.create({
                        channelId: newChannel.id
                    })

                    this.voiceChannels.set(newChannel.id, dvc)
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
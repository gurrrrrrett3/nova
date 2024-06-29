import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { DvcChannel } from "./entities/dvcChannel.entity.js";
import { ChannelType } from "discord.js";

export default class VoiceModule extends Module {

    constructor() {
        super({
            name: "voice",
            description: "No description provided>",
        });
    }

    public voiceChannels: Set<string> = new Set();

    override async onLoad(): Promise<boolean> {

        bot.client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId == newState.channelId) return;
            if (!newState.channel && oldState.channel && this.voiceChannels.has(oldState.channel.id) && oldState.channel.members.size === 0) {

                // dvc channel is empty
                this.voiceChannels.delete(oldState.channel.id)
                await oldState.channel.delete();

                return
            }

            if (!oldState.channel && newState.channel && newState.member) {

                const dvcChanenlRepo = db.em.getRepository(DvcChannel)
                const dvcChannel = await dvcChanenlRepo.findOne({
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
                    })

                    await newState.member.voice.setChannel(newChannel)
                    this.voiceChannels.add(newChannel.id)

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
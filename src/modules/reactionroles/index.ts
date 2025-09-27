import Core, { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";
import ReactionRole, { ReactionRoleType } from "./entities/reactionRole.entity.js";
import { Events } from "discord.js";

export default class ReactionRolesModule extends Module {
    constructor() {
        super({
            name: "reactionroles",
            description: "Core module for the bot, providing essential functionality and utilities.",
        });
    }

    getCoreModule(): ReactionRolesModule {
        return bot.moduleLoader.getModule("reactionroles") as ReactionRolesModule;
    }

    async onLoad(): Promise<boolean> {

        bot.client.on(Events.MessageReactionAdd, async (reaction, user) => {
            const id = ReactionRole.buildId(reaction.message.id, reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name || "")
            console.log(id)
            const reactionRole = await Core.db.em.findOne(ReactionRole, id)
            if (!reactionRole) return;
            if (user.bot) return;

            const guild = reaction.message.guild
            if (!guild) return
            const member = guild.members.cache.get(user.id) || await guild.members.fetch(user.id).catch()
            if (!member) return;

            const hasRole = member.roles.cache.has(reactionRole.roleId)

            switch (reactionRole.type) {
                case ReactionRoleType.Add:
                    !hasRole && await member.roles.add(reactionRole.roleId).catch()
                    break
                case ReactionRoleType.Remove:
                    hasRole && await member.roles.remove(reactionRole.roleId).catch()
                    break
                case ReactionRoleType.Toggle:
                    hasRole
                        ? await member.roles.remove(reactionRole.roleId).catch()
                        : await member.roles.add(reactionRole.roleId).catch()
                    break
            }

            await reaction.users.remove(user.id)

        })

        return true
    }

}
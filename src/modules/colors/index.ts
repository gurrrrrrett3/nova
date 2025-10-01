import Core, { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { Guild, GuildResolvable, Role, UserResolvable } from "discord.js";
import ColorRole from "./entities/colorRole.entity.js";

export default class ColorsModule extends Module {
    constructor() {
        super({
            name: "colors",
            description: "Core module for the bot, providing essential functionality and utilities.",
        });
    }

    public static readonly CONTROL_ROLE_NAME = "Nova | Colors Below"

    public static getColorsModule(): ColorsModule {
        return bot.moduleLoader.getModule("colors") as ColorsModule;
    }

    async onLoad(): Promise<boolean> {

        return true
    }

    public static async assignRole(rGuild: GuildResolvable, rUser: UserResolvable, colorValue: `#${string}`, colorName?: string): Promise<Role | undefined> {

        colorName = colorName || colorValue

        const guildResolved = bot.client.guilds.resolveId(rGuild)
        if (!guildResolved) return
        const guild = bot.client.guilds.cache.get(guildResolved)
        if (!guild) return

        const userResolved = bot.client.users.resolveId(rUser)
        if (!userResolved) return
        const member = guild.members.cache.get(userResolved) || await guild.members.fetch(userResolved)
        await guild.roles.fetch()
        let role = guild.roles.cache.find(r => r.name === colorName && r.hexColor == colorValue)

        const repo = Core.db.em.getRepository(ColorRole)

        if (!role) {
            // weve gotta make it
            // find the control role
            let controlRole = guild.roles.cache.find(r => r.name === ColorsModule.CONTROL_ROLE_NAME)

            if (!controlRole) {
                // make it, put it as high as i possibly can

                const botRole = guild.roles.botRoleFor(bot.client.user?.id || "")
                if (!botRole) return  // shouldnt happen

                controlRole = await guild.roles.create({
                    name: ColorsModule.CONTROL_ROLE_NAME,
                    position: botRole.position - 1,
                    reason: "needed this, thanks",
                    permissions: [],
                    mentionable: false,
                })
            }

            // create the role right below the control role
            role = await guild.roles.create({
                name: colorName,
                colors: {
                    primaryColor: colorValue
                },
                reason: `created for ${member.user.username}`,
                position: controlRole.position - 1,
                permissions: [],
                mentionable: false,
            })

            await repo.upsert(new ColorRole(guild.id, role.id))
        }

        // remove all color roles from member

        const colorRoles = await repo.find({
            guildId: guild.id
        })

        // diff
        const memberRoles = member.roles.cache.filter(r => colorRoles.some(cr => cr.roleId === r.id))
        console.log(member.roles.cache)
        await member.roles.remove(memberRoles)
        await member.roles.add(role)

        this.updateColorRoles(guild) // does not need to await it can happen in the bg 

        return role

    }

    public static async updateColorRoles(guild: Guild) {
        const repo = Core.db.em.getRepository(ColorRole)
        // find all color roles with no members
        const colorRoles = await repo.find({
            guildId: guild.id
        })

        const guildRoles = await guild.roles.fetch()
        const colorRolesWithNoMembers = colorRoles.filter(cr => {
            const role = guildRoles.get(cr.roleId)
            return role && role.members.size === 0
        })

        // delete the roles with no members
        for (const cr of colorRolesWithNoMembers) {
            const role = guildRoles.get(cr.roleId)
            if (role) {
                await role.delete("No members in role")
                const entity = await repo.findOne({
                    roleId: role.id
                })

                entity && await db.em.removeAndFlush(entity)
            }
        }
    }

}
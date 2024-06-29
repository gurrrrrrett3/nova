import { bot, db } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { AutoRole } from "./entities/autoRole.entity.js";
import { RolePickerRole } from "./entities/rolePickerRole.entity.js";
import EmbedUtil from "../util/util/embed.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

export default class RolesModule extends Module {

    constructor() {
        super({
            name: "roles",
            description: "No description provided>",
        });
    }

    public static getRolesModule(): RolesModule {
        return bot.moduleLoader.getModule("roles") as RolesModule;
    }

    override async onLoad(): Promise<boolean> {

        bot.client.on("guildMemberAdd", async (member) => {

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roles = await autoRoleRepository.find({
                guildId: member.guild.id
            });

            if (roles.length === 0) {
                return;
            }

            for (const role of roles) {
                const guildRole = member.guild.roles.cache.get(role.roleId);
                if (!guildRole) {
                    continue;
                }
                await member.roles.add(guildRole);
            }

        });

        bot.buttonManager.registerButton("role_picker_button", async (interaction) => {
            const guildId = interaction.guildId;
            const rolePickerRoleRepository = db.em.getRepository(RolePickerRole)

            const roles = await rolePickerRoleRepository.find({
                guildId
            }, {
                orderBy: {
                    order: "ASC"
                }
            });

            const embed = EmbedUtil.baseEmbed()
                .setTitle("Role Picker")

            const memberRoleManager = interaction.guild?.members.cache.get(interaction.user.id)?.roles || await interaction.guild?.members.fetch(interaction.user.id).then((member) => member.roles);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("role_picker_menu")
                .setPlaceholder("Select a role")
                .setMinValues(0)
                .addOptions(roles.map((role) => ({
                    label: role.name,
                    value: role.roleId,
                    description: role.description || undefined,
                    emoji: role.emoji || undefined,
                    default: memberRoleManager?.cache.has(role.roleId) || false
                })))

            row.addComponents(selectMenu)

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        })

        bot.selectMenuManager.registerMenu("role_picker_menu", async (interaction) => {
            const rolePickerRoleRepository = db.em.getRepository(RolePickerRole)

            const roles = await rolePickerRoleRepository.find({
                guildId: interaction.guildId
            });

            await interaction.deferUpdate();

            const memberRoleManager = interaction.guild?.members.cache.get(interaction.user.id)?.roles || await interaction.guild?.members.fetch(interaction.user.id).then((member) => member.roles);

            if (!memberRoleManager) {
                return;
            }

            await Promise.all(roles.map(async (role) => {

                const guildRole = interaction.guild?.roles.cache.get(role.roleId);

                if (!guildRole) {
                    return;
                }

                if (interaction.values.includes(role.roleId)) {
                    await memberRoleManager.add(guildRole).catch(() => {
                        // failed to add role
                        this.logger.error(`Failed to add role ${role.roleId} to user ${interaction.user.id} in guild ${interaction.guildId}`)
                    })
                } else {
                    await memberRoleManager.remove(guildRole).catch(() => {
                        // failed to remove role
                        this.logger.error(`Failed to remove role ${role.roleId} from user ${interaction.user.id} in guild ${interaction.guildId}`)
                    })
                }

            })
            );

            interaction.followUp({
                content: "Roles updated.",
                ephemeral: true
            });

        });

        return true;
    }

    public async sendRolePickerEmbed(channelId: string): Promise<{
        success: boolean,
        message?: string
    }> {

        const channel = bot.client.channels.resolve(channelId);
        if (!channel || !channel.isTextBased() || !("guild" in channel)) {
            return {
                success: false,
                message: "Invalid channel"
            }
        }

        const embed = EmbedUtil.baseEmbed(channel.guild)
            .setDescription("Click the button below to get your roles!")

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("role_picker_button")
                    .setLabel("Get Roles")
                    .setStyle(ButtonStyle.Primary)
            )

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        return {
            success: true
        }
    }
}
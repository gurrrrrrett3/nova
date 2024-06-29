import { PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { db } from "../../../core/index.js";
import { AutoRole } from "../entities/autoRole.entity.js";
import EmbedUtil from "../../util/util/embed.js";
import { RolePickerRole } from "../entities/rolePickerRole.entity.js";
import RolesModule from "../index.js";

const Command = new SlashCommandBuilder()
  .setName("roleadmin")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setDMPermission(false)
  .setDescription("Manage role configurations.")
  .addSubcommandGroup((group) =>
    group
      .setName("autoroles")
      .setDescription("Manage auto assigned roles")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a role to auto assign")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to auto assign")
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToAdd = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToAdd.id;

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roleEntity = autoRoleRepository.create({
              roleId,
              guildId
            })

            await db.em.persistAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToAdd.id}> will now be assigned on join.`)
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Remove a role from auto assign")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to remove from auto assign")
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToRemove = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToRemove.id;

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roleEntity = await autoRoleRepository.findOne({
              roleId,
              guildId
            });

            if (!roleEntity) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToRemove.id}> is not set to be auto assigned.`)
                ]
              });
              return;
            }

            await db.em.removeAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToRemove.id}> will no longer be assigned on join.`)
              ]
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("List all roles that are auto assigned")
          .setFunction(async (interaction) => {
            const guildId = interaction.guildId!;

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roles = await autoRoleRepository.find({
              guildId
            });

            if (roles.length === 0) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription("No roles are set to be auto assigned.")
                ]
              });
              return;
            }

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(
                  `Roles set to be auto assigned:\n${roles.map((role) => `<@&${role.roleId}>`).join("\n")}`
                )
              ]
            });
          })
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("rolepicker")
      .setDescription("Manage role picker configurations")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a role to the role picker")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to add to the role picker")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name of the role in the role picker")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("description")
              .setDescription("The description of the role in the role picker")
          )
          .addStringOption((option) =>
            option
              .setName("emoji")
              .setDescription("The emoji to use for the role in the role picker")
          )
          .setFunction(async (interaction) => {
            const roleToAdd = interaction.options.getRole("role", true);
            const name = interaction.options.getString("name", true);
            const description = interaction.options.getString("description") || "";
            const emoji = interaction.options.getString("emoji") || "";

            const guildId = interaction.guildId!;
            const roleId = roleToAdd.id;

            const roleEntity = db.em.getRepository(RolePickerRole).create({
              roleId,
              guildId,
              name,
              description,
              emoji,
              order: 0
            })

            await db.em.persistAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToAdd.id}> will now be in the role picker.`)
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Remove a role from the role picker")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to remove from the role picker")
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToRemove = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToRemove.id;

            const roleEntity = await db.em.getRepository(RolePickerRole).findOne({
              roleId,
              guildId
            });

            if (!roleEntity) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToRemove.id}> is not in the role picker.`)
                ]
              });
              return;
            }

            await db.em.removeAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToRemove.id}> will no longer be in the role picker.`)
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("List all roles in the role picker")
          .setFunction(async (interaction) => {
            const guildId = interaction.guildId!;

            const roles = await db.em.getRepository(RolePickerRole).find({
              guildId
            });

            if (roles.length === 0) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription("No roles are in the role picker.")
                ]
              });
              return;
            }

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(
                  `Roles in the role picker:\n${roles.map((role) => `<@&${role.roleId}>`).join("\n")}`
                )
              ]
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("order")
          .setDescription("Set the order of roles in the role picker")
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("The role to set the order of")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("order")
              .setDescription("The order of the role in the role picker")
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToOrder = interaction.options.getRole("role", true);
            const order = interaction.options.getInteger("order", true);
            const guildId = interaction.guildId!;
            const roleId = roleToOrder.id;
            const roleRepo = db.em.getRepository(RolePickerRole);

            // change the order of all roles so that the new role can be inserted at the specified order
            const roles = await roleRepo.find({
              guildId
            });

            const role = roles.find((role) => role.roleId === roleId);

            if (!role) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToOrder.id}> is not in the role picker.`)
                ]
              });
              return;
            }

            for (const role of roles) {
              if (role.order >= order) {
                role.order++;
              }
            }

            const roleEntity = await roleRepo.findOne({
              roleId,
              guildId
            });

            if (!roleEntity) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToOrder.id}> is not in the role picker.`)
                ]
              });
              return;
            }

            roleEntity.order = order;
            await db.em.persistAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(`<@&${roleToOrder.id}> is now in position ${order} in the role picker.`)
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("embed")
          .setDescription("Send the role picker embed")
          .setFunction(async (interaction) => {
            const channel = interaction.channel!;

            await RolesModule.getRolesModule().sendRolePickerEmbed(channel.id);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription("Role picker embed sent.")
              ],
              ephemeral: true
            });

          })
      )
  )

export default Command;

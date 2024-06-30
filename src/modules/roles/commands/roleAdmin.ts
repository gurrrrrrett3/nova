import { PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { db } from "../../../core/index.js";
import { AutoRole } from "../entities/autoRole.entity.js";
import EmbedUtil from "../../util/util/embed.js";
import { RolePickerRole } from "../entities/rolePickerRole.entity.js";
import RolesModule from "../index.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import i18next, { t } from "i18next";

const Command = new SlashCommandBuilder()
  .setName("roleadmin")
  .setDescription(t("roles:commands.roleadmin.description"))
  .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.name"))
  .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.description"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setDMPermission(false)
  .addSubcommandGroup((group) =>
    group
      .setName("autoroles")
      .setDescription(t("roles:commands.roleadmin.autoroles.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.description"))
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription(t("roles:commands.roleadmin.autoroles.add.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.add.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.add.description"))
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription(t("roles:commands.roleadmin.autoroles.add.options.role.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.add.options.role.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.add.options.role.description"))
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToAdd = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToAdd.id;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roleEntity = autoRoleRepository.create({
              roleId,
              guildId
            })

            await db.em.persistAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.autoroles.add.success", { role: `<@&${roleToAdd.id}>` }))
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription(t("roles:commands.roleadmin.autoroles.remove.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.remove.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.remove.description"))
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription(t("roles:commands.roleadmin.autoroles.remove.options.role.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.remove.options.role.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.remove.options.role.description"))
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToRemove = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToRemove.id;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roleEntity = await autoRoleRepository.findOne({
              roleId,
              guildId
            });

            if (!roleEntity) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.autoroles.remove.notFound", { role: roleToRemove.toString() }))
                ]
              });
              return;
            }

            await db.em.removeAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.autoroles.remove.success", { role: roleToRemove.toString() }))
              ]
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription(t("roles:commands.roleadmin.autoroles.list.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.list.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.autoroles.list.description"))
          .setFunction(async (interaction) => {
            const guildId = interaction.guildId!;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const autoRoleRepository = db.em.getRepository(AutoRole)

            const roles = await autoRoleRepository.find({
              guildId
            });

            if (roles.length === 0) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.autoroles.list.empty"))
                ]
              });
              return;
            }

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild)
                  .setTitle(t("roles:commands.roleadmin.autoroles.list.title"))
                  .setDescription(
                    roles.map((role) => `<@&${role.roleId}>`).join("\n")
                  )
              ]
            });
          })
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("rolepicker")
      .setDescription(t("roles:commands.roleadmin.rolepicker.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.description"))
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription(t("roles:commands.roleadmin.rolepicker.add.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.description"))
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription(t("roles:commands.roleadmin.rolepicker.add.options.role.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.role.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.role.description"))
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription(t("roles:commands.roleadmin.rolepicker.add.options.name.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.name.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.name.description"))
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("description")
              .setDescription(t("roles:commands.roleadmin.rolepicker.add.options.description.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.description.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.description.description"))
          )
          .addStringOption((option) =>
            option
              .setName("emoji")
              .setDescription(t("roles:commands.roleadmin.rolepicker.add.options.emoji.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.emoji.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.add.options.emoji.description"))
          )
          .setFunction(async (interaction) => {
            const roleToAdd = interaction.options.getRole("role", true);
            const name = interaction.options.getString("name", true);
            const description = interaction.options.getString("description") || "";
            const emoji = interaction.options.getString("emoji") || "";

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

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
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.rolepicker.add.success", { role: `<@&${roleToAdd.id}>` }))
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription(t("roles:commands.roleadmin.rolepicker.remove.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.remove.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.remove.description"))
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription(t("roles:commands.roleadmin.rolepicker.remove.options.role.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.remove.options.role.name"))
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToRemove = interaction.options.getRole("role", true);
            const guildId = interaction.guildId!;
            const roleId = roleToRemove.id;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const roleEntity = await db.em.getRepository(RolePickerRole).findOne({
              roleId,
              guildId
            });

            if (!roleEntity) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:error.notInPicker", { role: roleToRemove.toString() }))
                ]
              });
              return;
            }

            await db.em.removeAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.rolepicker.remove.success", { role: roleToRemove.toString() }))
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription(t("roles:commands.roleadmin.rolepicker.list.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.list.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.list.description"))
          .setFunction(async (interaction) => {
            const guildId = interaction.guildId!;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const roles = await db.em.getRepository(RolePickerRole).find({
              guildId
            });

            if (roles.length === 0) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.rolepicker.list.empty"))
                ]
              });
              return;
            }

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild)
                  .setTitle(t("roles:commands.roleadmin.rolepicker.list.title"))
                  .setDescription(
                    roles.map((role) => `<@&${role.roleId}>`).join("\n")
                  )
              ]
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("order")
          .setDescription(t("roles:commands.roleadmin.rolepicker.order.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.description"))
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription(t("roles:commands.roleadmin.rolepicker.order.options.role.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.options.role.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.options.role.description"))
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("order")
              .setDescription(t("roles:commands.roleadmin.rolepicker.order.options.order.description"))
              .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.options.order.name"))
              .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.order.options.order.description"))
              .setRequired(true)
          )
          .setFunction(async (interaction) => {
            const roleToOrder = interaction.options.getRole("role", true);
            const order = interaction.options.getInteger("order", true);
            const guildId = interaction.guildId!;
            const roleId = roleToOrder.id;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            const roleRepo = db.em.getRepository(RolePickerRole);

            // change the order of all roles so that the new role can be inserted at the specified order
            const roles = await roleRepo.find({
              guildId
            });

            const role = roles.find((role) => role.roleId === roleId);

            if (!role) {
              await interaction.reply({
                embeds: [
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:error.notInPicker", { role: roleToOrder.toString() }))
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
                  EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:error.notInPicker", { role: roleToOrder.toString() }))
                ]
              });
              return;
            }

            roleEntity.order = order;
            await db.em.persistAndFlush(roleEntity);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.rolepicker.order.success", { role: roleToOrder.toString(), position: order }))
              ]
            });

          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("embed")
          .setDescription(t("roles:commands.roleadmin.rolepicker.embed.description"))
          .setNameLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.embed.name"))
          .setDescriptionLocalizations(LanguageLoader.getKeyLocalications("roles:commands.roleadmin.rolepicker.embed.description"))
          .setFunction(async (interaction) => {
            const channel = interaction.channel!;

            const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

            await RolesModule.getRolesModule().sendRolePickerEmbed(channel.id);

            await interaction.reply({
              embeds: [
                EmbedUtil.baseEmbed(interaction.guild).setDescription(t("roles:commands.roleadmin.rolepicker.embed.success"))
              ],
              ephemeral: true
            });

          })
      )
  )

export default Command;

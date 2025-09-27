import { ChannelType, EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits } from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import Time, { time } from "../../../core/utils/time.js";
import i18next, { t } from "i18next";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import Core from "../../../core/index.js";
import ReactionRole, { ReactionRoleType } from "../entities/reactionRole.entity.js";
import EmbedUtil from "../../util/util/embed.js";

const Command = new SlashCommandBuilder()
  .setName("reactionroleadmin")
  .setDescription(t("reactionroles:commands.reactionroleadmin.description"))
  .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.name"))
  .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.description"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setDMPermission(false)
  .addSubcommand(subcommand => subcommand
    .setName("set")
    .setDescription(t("reactionroles:commands.reactionroleadmin.set.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.description"))
    .addChannelOption(option => option
      .setName("channel")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.channel.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.channel.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.channel.description"))
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption(option => option
      .setName("messageid")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.messageid.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.messageid.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.messageid.description"))
      .setRequired(true)
      .setAutocomplete((interaction, text) => {
        return new Promise(async (resolve) => {
          const channelId = interaction.options.data[0].options?.find(o => o.name == "channel")?.value
          const hint = [{
            name: "reactionroles:commands.reactionroleadmin.set.options.messageid.hint",
            value: ""
          }]
          if (!channelId) {
            return resolve(hint)
          }

          const timeout = setTimeout(() => resolve(hint), 3000)
          const messages = await (interaction.guild?.channels.cache.get(channelId as string) as GuildTextBasedChannel)?.messages.fetch({ limit: 25, cache: true, }).catch(() => undefined);
          clearTimeout(timeout)

          resolve(messages?.map(m => ({
            name: `${Time.toSingleUnitRelativeTime(m.createdAt.getTime(), Date.now(), true)} - ${m.content.substring(0, 50)}`,
            value: m.id
          })) || hint)

        })
      })
    )
    .addStringOption(option => option
      .setName("emoji")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.emoji.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.emoji.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.emoji.description"))
      .setRequired(true)
    )
    .addRoleOption(option => option
      .setName("role")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.role.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.role.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.role.description"))
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("type")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.type.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.type.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.type.description"))
      .addChoices(...LanguageLoader.getChoiceLocalizations<string>("reactionroles:commands.reactionroleadmin.set.options.type", [
        "add", "remove", "value"
      ])
      )
    )
    .setFunction(async (interaction) => {
      const type = interaction.options.getString("type");
      const channel = interaction.options.getChannel("channel", true) as GuildTextBasedChannel
      const messageId = interaction.options.getString("messageid", true);
      const emoji = interaction.options.getString("emoji", true);
      const role = interaction.options.getRole("role", true);

      const typeConversions = {
        add: ReactionRoleType.Add,
        remove: ReactionRoleType.Remove,
        toggle: ReactionRoleType.Toggle
      }

      const reactionRoleType = type && typeConversions[type as keyof typeof typeConversions] ? typeConversions[type as keyof typeof typeConversions] : ReactionRoleType.Toggle

      const t = await i18next.changeLanguage(interaction.guild?.preferredLocale || "en-US");

      const message = await channel.messages.fetch(messageId).catch(() => undefined)

      if (!message) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            EmbedUtil.errorEmbed(interaction.guild)
              .setTitle(t("reactionroles:errors.messageNotFound.title"))
              .setDescription(t("reactionroles:errors.messageNotFound.description", { channel: channel.toString() }))

          ]
        })
        return
      }

      const reactionRoleRepository = Core.db.em.getRepository(ReactionRole)

      const reactionRole = new ReactionRole(interaction.guildId as string, channel.id, messageId, role.id, emoji, reactionRoleType)

      const existingReactionRole = await reactionRoleRepository.findOne(reactionRole.id)
      if (existingReactionRole) {
        Core.db.em.remove(existingReactionRole)
      }

      await Core.db.em.persistAndFlush(reactionRole);

      // react to the mesaage

      const res = await message.react(emoji).catch(() => undefined)
      if (!res) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            EmbedUtil.errorEmbed(interaction.guild)
              .setTitle(t("reactionroles:errors.invalidEmoji.title"))
              .setDescription(t("reactionroles:errors.invalidEmoji.description"))
          ]
        })
        return
      }

      await interaction.reply({
        ephemeral: true,
        content: t("reactionroles:commands.reactionroleadmin.set.success.title")
      })
    })
  )
  .addSubcommand(subcommand => subcommand
    .setName("delete")
    .setDescription(t("reactionroles:commands.reactionroleadmin.delete.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.delete.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.delete.description"))
    .addChannelOption(option => option
      .setName("channel")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.channel.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.channel.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.channel.description"))
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption(option => option
      .setName("messageid")
      .setDescription(t("reactionroles:commands.reactionroleadmin.set.options.messageid.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.messageid.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.set.options.messageid.description"))
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("emoji")
      .setDescription(t("reactionroles:commands.reactionroleadmin.delete.options.emoji.description"))
      .setNameLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.delete.options.emoji.name"))
      .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("reactionroles:commands.reactionroleadmin.delete.options.emoji.description"))
      .setRequired(true)
    )
    .setFunction(async (interaction) => {


    })
  )

export default Command;
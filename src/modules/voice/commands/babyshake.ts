import { t } from "i18next";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { ChannelType, GuildMember, PermissionFlagsBits } from "discord.js";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import VoiceModule from "../index.js";

const Command = new SlashCommandBuilder()
    .setName("babyshake")
    .setDescription(t("voice:commands.babyshake.description"))
    .setNameLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.name"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false)
    .addUserOption(option =>
        option.setName("victim")
            .setDescription(t("voice:commands.babyshake.options.victim.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.options.victim.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.options.victim.description"))
            .setRequired(true)
    )
    .addNumberOption(option =>
        option.setName("time")
            .setDescription(t("voice:commands.babyshake.options.time.description"))
            .setNameLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.options.time.name"))
            .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("voice:commands.babyshake.options.time.description"))
            .setMinValue(1)
            .setMaxValue(60)
            .setRequired(true)
    )
    .setFunction(async (interaction) => {
        const victim = interaction.options.getUser("victim", true);
        const time = interaction.options.getNumber("time", true);
        const sourceChannel = (interaction.member as GuildMember)?.voice.channel;

        if (!sourceChannel) {
            await interaction.reply({
                content: t("voice:commands.babyshake.error.noChannel"),
                ephemeral: true
            });
            return;
        }

        if (!interaction.guild || !interaction.member) return;

        const member = interaction.guild.members.cache.get(victim.id);

        if (!member) {
            await interaction.reply({
                content: t("voice:commands.babyshake.error.memberNotFound"),
                ephemeral: true
            });
            return;
        }

        await interaction.guild.channels.fetch();

        // find channels visible to the user
        const viewableChannels = interaction.guild!.channels.cache.filter(channel =>
            channel.type === ChannelType.GuildVoice &&
            channel.id !== sourceChannel.id &&
            [member, ...member.roles.cache.values()].some(role => channel.permissionsFor(role).has(PermissionFlagsBits.ViewChannel))
        ).map(channel => channel.id);

        if (viewableChannels.length === 0) {
            await interaction.reply({
                content: t("voice:commands.babyshake.error.noViewableChannels"),
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: t("voice:commands.babyshake.start", { victim: victim.toString(), time }),
            ephemeral: true
        });

        const nextTargetChannelId = viewableChannels[Math.floor(Math.random() * viewableChannels.length)];

        VoiceModule.babyShakeCache[interaction.id] = {
            sourceChannelId: sourceChannel.id,
            viewableChannelIds: viewableChannels,
            nextTargetChannelId,
            timeLeft: time,
            timer: setInterval(async () => {
                const cache = VoiceModule.babyShakeCache[interaction.id];
                const channelPool = cache.viewableChannelIds.filter(id => id !== cache.nextTargetChannelId);

                if (channelPool.length === 0) {
                    clearInterval(cache.timer);
                    delete VoiceModule.babyShakeCache[interaction.id];
                    return;
                }

                if (cache.timeLeft <= 0) {
                    await member.voice.setChannel(sourceChannel).catch(() => {
                        // can't move member back to source channel
                        console.error("Failed to move member back to source channel.");
                    });

                    await interaction.editReply({
                        content: t("voice:commands.babyshake.end", { victim: victim.toString() }),
                        components: []
                    });

                    clearInterval(cache.timer);
                    delete VoiceModule.babyShakeCache[interaction.id];
                    return;
                }

                cache.timeLeft--;

                const nextChannelId = channelPool[Math.floor(Math.random() * channelPool.length)];
                const nextChannel = interaction.guild!.channels.cache.get(nextChannelId);

                if (!nextChannel || nextChannel.type !== ChannelType.GuildVoice) {
                    clearInterval(cache.timer);
                    delete VoiceModule.babyShakeCache[interaction.id];
                    return;
                }

                try {
                    await member.voice.setChannel(nextChannel);
                    cache.nextTargetChannelId = nextChannelId;
                } catch (error) {
                    console.error("Failed to move member:", error);
                    clearInterval(cache.timer);
                    delete VoiceModule.babyShakeCache[interaction.id];
                }
            }, 1000)
        };

    });

export default Command;
import { t } from "i18next";
import LanguageLoader from "../../../core/loaders/languageLoader.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";
import { bot } from "../../../core/index.js";
import CommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder.js";

const Command = new SlashCommandBuilder()
    .setName("help")
    .setEnabled(false)
    .setNameLocalizations(LanguageLoader.getKeyLocalizations("core:commands.help.name"))
    .setDescription(t("core:commands.help.description"))
    .setDescriptionLocalizations(LanguageLoader.getKeyLocalizations("core:commands.help.description"))
    .setDMPermission(true)
// .setPostloadHook(async () => {
//     bot.moduleLoader.getLoadedModules().forEach((module) => {
//         const subcommandGroup = Command.addSubcommandGroup((group) =>
//             group
//                 .setName(module.name)
//                 .setDescription(module.description || t("core:commands.help.module.description", { module: module.name }))
//         )

//         module.commands.forEach((command: CommandBuilder) => {
//             const commandData = command.toJSON();
//             subcommandGroup.addSubcommand((subcommand) => {
//                 subcommand
//                     .setName(commandData.name)
//                     .setDescription(commandData.description || t("core:commands.help.command.description", { command: commandData.name }))

//                 if (commandData.name_localizations) subcommand.setNameLocalizations(commandData.name_localizations);
//                 if (commandData.description_localizations) subcommand.setDescriptionLocalizations(commandData.description_localizations);

//                 return subcommand
//             }
//             );
//         })
//     })
// })

export default Command;
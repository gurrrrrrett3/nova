import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  LocaleString,
  LocalizationMap,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandMentionableOption,
  SlashCommandRoleOption,
  SlashCommandUserOption,
} from "discord.js";
import Logger from "../../utils/logger.js";
import CustomSlashCommandIntegerOption from "./customSlashCommandIntegerOption.js";
import CustomSlashCommandNumberOption from "./customSlashCommandNumberOption.js";
import CustomSlashCommandStringOption from "./customSlashCommandStringOption.js";
import CustomSlashCommandSubcommandBuilder from "./customSlashCommandSubcommandBuilder.js";
import CustomSubommandBuilder from "./customSlashCommandSubcommandBuilder.js";
import CustomSlashCommandSubcommandGroupBuilder from "./customSlashCommandSubcommandGroupBuilder.js";
import LanguageLoader from "../languageLoader.js";
import { t } from "i18next";

export default class CommandBuilder {
  protected enabled: boolean = true;
  private _builder = new SlashCommandBuilder();
  private _module = "";
  private _languageRoot?: string
  private _customOptions: (
    | CustomSlashCommandStringOption
    | CustomSlashCommandIntegerOption
    | CustomSlashCommandNumberOption
    | CustomSubommandBuilder
    | CustomSlashCommandSubcommandGroupBuilder
  )[] = [];
  public execute: (interaction: ChatInputCommandInteraction) => Promise<any> = async () => Promise.resolve();
  public postload?: () => (Promise<void> | void)

  constructor() { }

  toJSON = this._builder.toJSON.bind(this._builder);

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  setLanguageRoot(root: string): this {
    this._languageRoot = root
    this.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${root}.name`))
    this.setDescription(t(`${root}.description`))
    this.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${root}.description`))
    return this
  }

  setFunction(callback: (interaction: ChatInputCommandInteraction) => Promise<any>): this {
    this.execute = callback;
    return this;
  }

  setPostloadHook(callback: () => Promise<void> | void): this {
    this.postload = callback;
    return this;
  }

  setName(name: string) {
    this._builder.setName(name);
    return this;
  }

  setNameLocalization(locale: LocaleString, localizedName: string | null) {
    this._builder.setNameLocalization(locale, localizedName);
    return this;
  }

  setNameLocalizations(localizedNames: LocalizationMap | null) {
    this._builder.setNameLocalizations(localizedNames);
    return this;
  }

  setDescription(description: string) {
    this._builder.setDescription(description);
    return this;
  }

  setDefaultMemberPermissions(permissions: string | number | bigint | null | undefined) {
    this._builder.setDefaultMemberPermissions(permissions)
    return this;
  }

  setDMPermission(permission: boolean): this {
    this._builder.setDMPermission(permission);
    return this;
  }

  setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null) {
    this._builder.setDescriptionLocalization(locale, localizedDescription);
    return this;
  }

  setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null) {
    this._builder.setDescriptionLocalizations(localizedDescriptions);
    return this;
  }

  addStringOption(
    callback: (option: CustomSlashCommandStringOption) => CustomSlashCommandStringOption | undefined
  ): this {
    const opt = new CustomSlashCommandStringOption(this._languageRoot);
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addStringOption(res.builder);
    return this;
  }

  addIntegerOption(
    callback: (option: CustomSlashCommandIntegerOption) => CustomSlashCommandIntegerOption | undefined
  ): this {
    const opt = new CustomSlashCommandIntegerOption(this._languageRoot);
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addIntegerOption(res.builder);
    return this;
  }

  addNumberOption(
    callback: (option: CustomSlashCommandNumberOption) => CustomSlashCommandNumberOption | undefined
  ): this {
    const opt = new CustomSlashCommandNumberOption(this._languageRoot);
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addNumberOption(res.builder);
    return this;
  }

  addSubcommand(
    callback: (option: CustomSlashCommandSubcommandBuilder) => CustomSlashCommandSubcommandBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandBuilder(this._languageRoot);
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommand(res.builder);
    return this;
  }

  addSubcommandGroup(
    callback: (
      option: CustomSlashCommandSubcommandGroupBuilder
    ) => CustomSlashCommandSubcommandGroupBuilder | undefined
  ): this {
    const opt = new CustomSlashCommandSubcommandGroupBuilder(this._languageRoot);
    let res = callback(opt);
    res = res || opt;
    this._customOptions.push(res);
    this._builder.addSubcommandGroup(res.builder);
    return this;
  }

  addAttachmentOption(
    callback: (option: SlashCommandAttachmentOption) => SlashCommandAttachmentOption | undefined
  ): this {
    const opt = new SlashCommandAttachmentOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addAttachmentOption(res);
    return this;
  }

  addBooleanOption(
    callback: (option: SlashCommandBooleanOption) => SlashCommandBooleanOption | undefined
  ): this {
    const opt = new SlashCommandBooleanOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addBooleanOption(res);
    return this;
  }

  addChannelOption(
    callback: (option: SlashCommandChannelOption) => SlashCommandChannelOption | undefined
  ): this {
    const opt = new SlashCommandChannelOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addChannelOption(res);
    return this;
  }

  addMentionableOption(
    callback: (option: SlashCommandMentionableOption) => SlashCommandMentionableOption | undefined
  ): this {
    const opt = new SlashCommandMentionableOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addMentionableOption(res);
    return this;
  }

  addRoleOption(callback: (option: SlashCommandRoleOption) => SlashCommandRoleOption | undefined): this {
    const opt = new SlashCommandRoleOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addRoleOption(res);
    return this;
  }

  addUserOption(callback: (option: SlashCommandUserOption) => SlashCommandUserOption | undefined): this {
    const opt = new SlashCommandUserOption();
    let res = callback(opt);
    res = res || opt;

    if (this._languageRoot) {
      res.setNameLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.name`))
      res.setDescription(t(`${this._languageRoot}.options.${res.name}.description`))
      res.setDescriptionLocalizations(LanguageLoader.getKeyLocalizations(`${this._languageRoot}.options.${res.name}.description`))
    }

    this._builder.addUserOption(res);
    return this;
  }

  toSlashCommandBuilder(): SlashCommandBuilder {
    return this._builder;
  }

  getName(): string {
    return this._builder.name;
  }

  getType(): "COMMAND" {
    return "COMMAND";
  }

  setModule(module: string) {
    this._module = module
  }

  getModule(): string {
    return this._module;
  }

  isChatInputCommandHandler(): this is CommandBuilder {
    return true;
  }

  run(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.Subcommand
    )
      ? interaction.options.getSubcommand()
      : null;
    const subcommandGroup = interaction.options.data.find(
      (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
    )
      ? interaction.options.getSubcommandGroup()
      : null;

    if (subcommandGroup) {
      const subcommandGroupObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
      ) as CustomSlashCommandSubcommandGroupBuilder;
      subcommandGroupObject.run(interaction);
    } else if (subcommand) {
      const subcommandObject = this._customOptions.find(
        (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
      ) as CustomSlashCommandSubcommandBuilder;
      return subcommandObject.run(interaction);
    } else {
      return this.execute(interaction);
    }

    return Promise.resolve();
  }

  async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.Subcommand
      )
        ? interaction.options.getSubcommand()
        : null;
      const subcommandGroup = interaction.options.data.find(
        (opt) => opt.type == ApplicationCommandOptionType.SubcommandGroup
      )
        ? interaction.options.getSubcommandGroup()
        : null;

      if (subcommandGroup) {
        const subcommandGroupObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandGroupBuilder && o.name === subcommandGroup
        ) as CustomSlashCommandSubcommandGroupBuilder;
        return subcommandGroupObject.handleAutocomplete(interaction);
      } else if (subcommand) {
        const subcommandObject = this._customOptions.find(
          (o) => o instanceof CustomSlashCommandSubcommandBuilder && o.name === subcommand
        ) as CustomSlashCommandSubcommandBuilder;
        return subcommandObject.handleAutocomplete(interaction);
      } else {
        const selectedObject = this._customOptions.find(
          (o) => o.name === interaction.options.getFocused(true).name
        );
        if (!selectedObject || !selectedObject.isCustomOption()) return;
        if (selectedObject && selectedObject.autocompleteCallback) {
          if (selectedObject.takesStringTypeOption()) {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              interaction.options.getFocused()
            );
            interaction.respond(res.filter((r) => r.name.length > 0 && r.value.length > 0));
            return;
          } else {
            const res = await selectedObject.autocompleteCallback(
              interaction,
              Number(interaction.options.getFocused())
            );
            interaction.respond(res.filter((r) => r.name.length > 0));
          }
        }
      }
    } catch (e) {
      Logger.error(this.getName(), e);
    }
  }
}

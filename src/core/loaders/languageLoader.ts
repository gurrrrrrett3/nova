import fs from 'fs';
import i18next, { t } from 'i18next';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { APIApplicationCommandOptionChoice } from 'discord.js';

export default class LanguageLoader {

    public static langs: Map<string, any> = new Map();
    public static logger = new Logger("Language");

    public static async loadLanguages() {
        await i18next.init({
            fallbackLng: "en-US",
            debug: false,
            resources: {},
            interpolation: {
                escapeValue: false
            }
        });
    }

    public static getKeyLocalizations(key: string): any { // Map<string, string> as any to avoid type errors
        if (!i18next.isInitialized) {
            LanguageLoader.logger.error("i18next is not initialized. Please call loadLanguages() first.");
            return {};
        }

        const keys = i18next.services.resourceStore.data;
        const langs = Object.keys(keys);

        const result: Record<string, string> = {};

        for (const lang of langs) {
            const value = i18next.t(key, { lng: lang });
            result[lang] = value;
        }

        return result;
    }

    public static getChoiceLocalizations<ValueType extends string | number>(root: string, choices: {
        id: string,
        value?: ValueType extends string ? string | undefined : number
    }[] | string[]): APIApplicationCommandOptionChoice<ValueType>[] {
        const localizations: APIApplicationCommandOptionChoice<ValueType>[] = [];

        for (let choice of choices) {
            if (typeof choice == "string") {
                choice = {
                    id: choice
                }
            }

            const key = `${root}.${choice.id}`;
            const choiceLocalizations = LanguageLoader.getKeyLocalizations(key);

            localizations.push({
                name: t(key),
                name_localizations: choiceLocalizations,
                value: (choice.value || choice.id) as ValueType
            });
        }

        return localizations;
    }

}
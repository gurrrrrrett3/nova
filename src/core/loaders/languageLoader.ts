import fs from 'fs';
import i18next from 'i18next';
import path from 'path';
import { Logger } from '../utils/logger.js';

export default class LanguageLoader {

    public static langFolder: string = path.resolve("./src/lang/")
    public static langs: Map<string, any> = new Map();
    public static logger = new Logger("Language");

    public static async loadLanguages() {

        i18next.init({
            fallbackLng: "en-US",
            debug: false,
            resources: {},
            interpolation: {
                escapeValue: false
            }
        });

        const files = fs.readdirSync(this.langFolder);

        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const language = file.replace(".json", "");
            const resources = JSON.parse(fs.readFileSync(path.resolve(this.langFolder, file)).toString());

            const namespaces = Object.keys(resources);
            for (const namespace of namespaces) {
                i18next.addResourceBundle(language, namespace, resources[namespace]);
            }

            this.logger.info(`Loaded language file: ${file}`);
        }
    }

    public static getKeyLocalications(key: string): any { // Map<string, string> as any to avoid type errors
        const keys = i18next.services.resourceStore.data;
        const langs = Object.keys(keys);

        const result: Record<string, string> = {};

        for (const lang of langs) {
            const value = i18next.t(key, { lng: lang });
            result[lang] = value;
        }

        return result;
    }

}
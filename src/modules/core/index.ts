import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class CoreModule extends Module {
    constructor() {
        super({
            name: "core",
            description: "Core module for the bot, providing essential functionality and utilities.",
        });
    }

    getCoreModule(): CoreModule {
        return bot.moduleLoader.getModule("core") as CoreModule;
    }

}
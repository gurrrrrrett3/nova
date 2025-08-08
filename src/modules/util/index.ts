import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class UtilModule extends Module {

    constructor() {
        super({
            name: "util",
            description: "Tiny ]utility module for various helper functions.",
        });
    }

    public static getUtilModule(): UtilModule {
        return bot.moduleLoader.getModule("util") as UtilModule;
    }

}
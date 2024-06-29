import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class UtilModule extends Module {

    constructor() {
        super({
            name: "util",
            description: "No description provided>",
        });
    }

    public static getUtilModule(): UtilModule {
        return bot.moduleLoader.getModule("util") as UtilModule;
    }

}
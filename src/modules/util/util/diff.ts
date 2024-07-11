import { ansi } from "./ansi.js";

export enum DiffAction {
    Unchanged,
    Added,
    Removed,
    Modified
}

export default class DiffUtil {

    public static diff(a: string, b: string): {
        original: string;
        new: string;
        action: DiffAction
    }[] {

        const oldArray = a.split("\n");
        const newArray = b.split("\n");

        const diff = [];

        for (let i = 0; i < oldArray.length; i++) {
            if (oldArray[i] === newArray[i]) {
                diff.push({
                    original: oldArray[i],
                    new: newArray[i],
                    action: DiffAction.Unchanged
                });
            } else {
                if (oldArray[i] === undefined) {
                    diff.push({
                        original: "",
                        new: newArray[i],
                        action: DiffAction.Added
                    });
                } else if (newArray[i] === undefined) {
                    diff.push({
                        original: oldArray[i],
                        new: "",
                        action: DiffAction.Removed
                    });
                } else {
                    diff.push({
                        original: oldArray[i],
                        new: newArray[i],
                        action: DiffAction.Modified
                    });
                }
            }
        }

        return diff;
    }

    public static formattedDiff(a: string, b: string): string {
        const diff = this.diff(a, b);

        let result = "";

        for (const line of diff) {
            switch (line.action) {
                case DiffAction.Unchanged:
                    result += `  ${line.original}`;
                    break;
                case DiffAction.Added:
                    result += `${ansi("..green")}+ ${line.new}`;
                    break;
                case DiffAction.Removed:
                    result += `${ansi("..red")}- ${line.original}`;
                    break;
                case DiffAction.Modified:
                    result += `${ansi("..red")}- ${line.original}\n${ansi("..green")}+ ${line.new}`;
                    break;
            }

            result += `${ansi("reset..")}\n`;
        }

        return result.slice(0, -1);
    }
}

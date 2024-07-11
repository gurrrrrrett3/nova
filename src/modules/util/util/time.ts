export default class TimeUtil {
    public static discordTimestamp(
        timestamp: Date,
        type:
            | "shortTime"
            | "longTime"
            | "shortDate"
            | "longDate"
            | "shortDateTime"
            | "longDateTime"
            | "relative" = "relative"
    ) {
        const convert = {
            shortTime: "t",
            longTime: "T",
            shortDate: "d",
            longDate: "D",
            shortDateTime: "f",
            longDateTime: "F",
            relative: "R",
        };

        return `<t:${Math.floor(timestamp.getTime() / 1000)}:${convert[type]}>`;
    }
}
import fs from "fs"
import path from "path"

export default class Utils {
  public static async getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? this.getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
  }

  public static removeUndefined<T>(arr: (T | undefined)[]): T[] {
    return arr.filter((item) => item !== undefined) as T[];
  }

  public static getColor(str: string) {
    // calculate hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // convert to hex
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }

  public static recursiveObjectEquality<T>(a: T, b: T): boolean {
    for (const key in a) {
      if (typeof a[key] === "object") {
        if (!this.recursiveObjectEquality(a[key], b[key])) {
          return false;
        }
      } else {
        if (a[key] !== b[key]) {
          return false;
        }
      }
    }
    return true;
  }

}
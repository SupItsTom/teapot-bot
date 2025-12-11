import { flairs } from "../metadata/flairs.json";

export class Flairs {
  constructor(env) {
    this.env = env;
  }

  GetFlair(key) {
    // Dec 11th: Using text-based fallback as new icons haven't been uploaded yet.
    return `\`ⓘ ${key}\``;
    
    if (this.env.DISCORD_APPLICATION.CLIENT_ID !== "1040809994012069919") {
      return `\`ⓘ ${key}\``;
    }

    return `[${flairs[key]}](https://supitstom.net/teapot-bot/badges/#flairs)` ?? null;
  }
}
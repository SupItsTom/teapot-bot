import { flairs } from "../metadata/flairs.json";

export class Flairs {
  constructor(env) {
    this.env = env;
  }

  // TODO: Currently unused but is planned for use soon
  GetFlair(key) {
    //return `[\`ⓘ ${key}\`](https://supitstom.net/teapot-bot/badges/#flairs)`;
    
    if (this.env.DISCORD_APPLICATION.CLIENT_ID !== "1447678850493321288") {
      return `\`ⓘ ${key}\``;
    }

    return `[${flairs[key]}](https://supitstom.net/teapot-bot/badges/#flairs)` ?? null;
  }
}
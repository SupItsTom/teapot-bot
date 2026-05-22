import { BetterStack } from "./uptime";

/**
 * Sends a POST request to the Teapot API with the provided data.
 *
 * @param {Object} env - The environment configuration object.
 * @param {Object} data - The data to be sent in the request.
 * @param {string} data.action - The main action to be performed by the API.
 * @param {string} [data.email] - The email address associated with the request (optional).
 * @param {string} [data.subaction] - The subaction to be performed, e.g., "changename" (optional).
 * @param {string} [data.newname] - The new name to be used if the subaction is "changename" (optional).
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the Teapot API.
 */
export function postTeapotRequest(env, data) {
  const base = {
    action: data?.action,
    ...(data?.email ? { email: data.email } : {}),
    ...(data?.token ? { token: data.token } : {}),
    ...(data?.column ? { column: data.column } : {}),
    key: env.TEAPOT_API.SECRET,
  };

  let extra = {};

  if (data?.subaction === "changename") {
    extra = {
      subaction: data.subaction,
      newname: data.newname
    };
  }

  if (data?.subaction === "setoptions") {
    const { action, email, token, subaction, ...options } = data;

    extra = {
      subaction: data.subaction,
      ...options
    };
  }

  const form = new URLSearchParams({
    ...base,
    ...extra
  });

  console.log(`[TeapotService]: Sending POST for ${form.toString().replace(`&key=${env.TEAPOT_API.SECRET}`, '')}`);

  return fetch(env.TEAPOT_API.URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
    },
    body: form
  })
    .then(res => res.json())
    .then(res => {
      console.log(`[TeapotService]: Completed POST for ${form.toString().replace(`&key=${env.TEAPOT_API.SECRET}`, '')} with body: ${res}`);
      return res;
    })
    .catch(console.error);
}

export const UserAvatarType = Object.freeze({
  DISABLED: 0,
  XBOX_GAMERPIC: 1,
  DISCORD_AVATAR: 2,
  CUSTOM: 3,
});

export const UserBannerType = Object.freeze({
  DISABLED: 0,
  XBOX_GAME_BANNER: 1,
  DISCORD_BANNER: 2,
  CUSTOM: 3,
});

export const avatarTypeLabel = (avatar_type) => ({
  [UserAvatarType.DISABLED]: "No Avatar",
  [UserAvatarType.XBOX_GAMERPIC]: "Xbox LIVE Gamerpic",
  [UserAvatarType.DISCORD_AVATAR]: "Discord Avatar",
  // [UserAvatarType.CUSTOM]: "Custom Avatar",
}[avatar_type] ?? "Unknown Avatar");

export const bannerTypeLabel = (banner_type) => ({
  [UserBannerType.DISABLED]: "No Banner",
  [UserBannerType.XBOX_GAME_BANNER]: "Last Played Game",
  [UserBannerType.DISCORD_BANNER]: "Discord Banner",
  // [UserBannerType.CUSTOM]: "Custom Banner",
}[banner_type] ?? "Unknown Banner");

export class TeapotBot {
  constructor(env) {
    this.env = env;
  }

  // Get the current users' linked email + settings
  async GetUser(discord_user) {
    // Fetch base user
    const user = await this.env.database
      .prepare(`
        SELECT id, email, timestamp
        FROM users
        WHERE id = ?1
      `)
      .bind(discord_user.id)
      .first();


    if (!user) {
      console.warn(`[DatabaseManager]: no user present for ${discord_user.id}`);
      return false;
    }


    const settings = await this.env.database
      .prepare(`
        SELECT avatar_type, banner_type, private
        FROM user_settings
        WHERE id = ?1
      `)
      .bind(discord_user.id)
      .first();


    user.settings = {
      avatar_type: settings?.avatar_type ?? UserAvatarType.XBOX_GAMERPIC,
      banner_type: settings?.banner_type ?? UserBannerType.XBOX_GAME_BANNER,
      private: Boolean(settings?.private)
    };

    console.log(`[DatabaseManager]: GetUser returned ${JSON.stringify(user)}`);

    return user;
  }

  // Register the current users' email for future use
  async RegisterUser(discord_user, email, settings = {}) {
    const userResult = await this.env.database
      .prepare(`
        REPLACE INTO users (
          id,
          email,
          timestamp
        )
        VALUES (?1, ?2, ?3)
      `)
      .bind(
        discord_user.id,
        email,
        new Date().toISOString()
      )
      .run();

    // Create/update settings
    // const settingsResult = await this.env.database
    //   .prepare(`
    //     REPLACE INTO user_settings (
    //       id,
    //       avatar_type,
    //       banner_type,
    //       private
    //     )
    //     VALUES (?1, ?2, ?3, ?4)
    //   `)
    //   .bind(
    //     discord_user.id,
    //     settings.avatar_type ?? 0,
    //     settings.banner_type ?? 0,
    //     settings.private ?? false
    //   )
    //   .run();

    console.log(`[DatabaseManager]: RegisterUser completed for: ${discord_user.id}, took: ${userResult.meta.duration}ms (by: ${userResult.meta.served_by}, colo: ${userResult.meta.served_by_colo}, region: ${userResult.meta.served_by_region})`);

    return {
      user: userResult,
      //settings: settingsResult
    };
  }

  // Update the users' profile privacy boolean
  async UpdateSettings(discord_user, settings = {}) {

    await this.env.database
      .prepare(`
      INSERT INTO user_settings (id, private, avatar_type, banner_type)
      VALUES (?1, 0, 0, 0)
      ON CONFLICT(id) DO NOTHING
    `)
      .bind(discord_user.id)
      .run();

    const fields = [];
    const values = [];

    if (settings.private !== undefined) {
      fields.push("private = ?1");
      values.push(settings.private ? 1 : 0);
    }

    if (settings.avatar_type !== undefined) {
      fields.push(`avatar_type = ?${values.length + 1}`);
      values.push(settings.avatar_type);
    }

    if (settings.banner_type !== undefined) {
      fields.push(`banner_type = ?${values.length + 1}`);
      values.push(settings.banner_type);
    }

    if (fields.length === 0) {
      return { skipped: true };
    }

    const query = `
    UPDATE user_settings
    SET ${fields.join(", ")}
    WHERE id = ?${values.length + 1}
  `;

    const result = await this.env.database
      .prepare(query)
      .bind(...values, discord_user.id)
      .run();

    console.log(`[DatabaseManager]: UpdateSettings completed for: ${discord_user.id}, took: ${result.meta.duration}ms (by: ${result.meta.served_by}, colo: ${result.meta.served_by_colo}, region: ${result.meta.served_by_region})`);

    return result;
  }

  // Remove the current users' records
  async UnregisterUser(discord_user) {
    const userResult = await this.env.database
      .prepare(`
        DELETE FROM users
        WHERE id = ?1
      `)
      .bind(discord_user.id)
      .run();

    const settingsResult = await this.env.database
      .prepare(`
        DELETE FROM user_settings
        WHERE id = ?1
      `)
      .bind(discord_user.id)
      .run();

    console.log(`[DatabaseManager]: UnregisterUser completed for: ${discord_user.id}, took: ${result.meta.duration}ms (by: ${result.meta.served_by}, colo: ${result.meta.served_by_colo}, region: ${result.meta.served_by_region})`);

    return {
      user: userResult,
      settings: settingsResult
    };
  }

  // Check to see if critical services are available
  AreMonitorsOnline() {

    /* TODO - CHECK IF CRITICAL THIRD-PARTY SERVICES ARE UP:
    * Return boolean if unreachable
    */

    return true;
  }
}
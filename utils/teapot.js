import { BetterStack } from "./uptime";

/**
 * Sends a POST request to the Teapot API with the provided data.
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
      newname: data.newname,
    };
  }

  if (data?.subaction === "setoptions") {
    const { action, email, token, subaction, ...options } = data;

    extra = {
      subaction: data.subaction,
      ...options,
    };
  }

  const form = new URLSearchParams({
    ...base,
    ...extra,
  });

  console.log(
    `[TeapotService]: Sending POST to ${form
      .toString()
      .replace(`&key=${env.TEAPOT_API.SECRET}`, "")}`
  );

  return fetch(env.TEAPOT_API.URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "DiscordBot (https://supitstom.net, 1.0)",
    },
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(
        `[TeapotService]: Completed POST to ${form
          .toString()
          .replace(`&key=${env.TEAPOT_API.SECRET}`, "")} with body: ${res}`
      );
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
}[avatar_type] ?? "Unknown Avatar");

export const bannerTypeLabel = (banner_type) => ({
  [UserBannerType.DISABLED]: "No Banner",
  [UserBannerType.XBOX_GAME_BANNER]: "Last Played Game",
  [UserBannerType.DISCORD_BANNER]: "Discord Banner",
}[banner_type] ?? "Unknown Banner");

export class TeapotBot {
  constructor(env) {
    this.env = env;
  }

  // Get user + settings
  async GetUser(discord_user) {
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
        SELECT avatar_type, banner_type, private, render_details
        FROM user_settings
        WHERE id = ?1
      `)
      .bind(discord_user.id)
      .first();

    user.settings = {
      avatar_type:
        settings?.avatar_type ?? UserAvatarType.XBOX_GAMERPIC,

      banner_type:
        settings?.banner_type ?? UserBannerType.XBOX_GAME_BANNER,

      private: Boolean(settings?.private),

      // NEW BOOLEAN FIELD
      render_details:
        settings?.render_details !== undefined
          ? Boolean(settings.render_details)
          : true,
    };

    console.log(`[DatabaseManager]: GetUser returned ${JSON.stringify(user)}`);

    return user;
  }

  // Register user
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
      .bind(discord_user.id, email, new Date().toISOString())
      .run();

    console.log(`[DatabaseManager]: RegisterUser completed for: ${discord_user.id}, took: ${userResult.meta.duration}ms`);

    return {
      user: userResult,
    };
  }

  // Update settings
  async UpdateSettings(discord_user, settings = {}) {
    await this.env.database
      .prepare(`
        INSERT INTO user_settings (id, private, avatar_type, banner_type, render_details)
        VALUES (?1, 0, 1, 1, 1)
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

    if (settings.render_details !== undefined) {
      fields.push(`render_details = ?${values.length + 1}`);
      values.push(settings.render_details ? 1 : 0);
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

    console.log(`[DatabaseManager]: UpdateSettings completed for: ${discord_user.id}, took: ${result.meta.duration}ms`);

    return result;
  }

  // Unregister user
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

    console.log(`[DatabaseManager]: UnregisterUser completed for: ${discord_user.id}`);

    return {
      user: userResult,
      settings: settingsResult,
    };
  }

  AreMonitorsOnline() {
    return true;
  }
}
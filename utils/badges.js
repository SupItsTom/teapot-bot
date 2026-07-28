import { postTeapotRequest, TeapotBot } from "./teapot";
import { UserFlags, hasFlag } from "./flags";
import { IsStaging } from "./client";

export const ProfileCardBadges = {
  BADGE_SYSTEM: `[<:System:1517631050702913697>](https://supitstom.net/teapot-bot/badges/#system)`,
  BADGE_DEVELOPER: `[<:Developer:1517633915085656204>](https://supitstom.net/teapot-bot/badges/#developer)`,
  BADGE_LIFETIME: `[<:Lifetime:1517631037243396239>](https://supitstom.net/teapot-bot/badges/#lifetime)`,
  BADGE_MOXAH: `[<:Moxah:1517631039030300834>](https://supitstom.net/teapot-bot/badges/#moxah)`,
  BADGE_PH: `[<:Contributor:1517631032629919855>](https://supitstom.net/teapot-bot/badges/#slut)`,
  BADGE_KALI: `[<:Bricker:1517631027156095066>](https://supitstom.net/teapot-bot/badges/#bricker)`,
  BADGE_SUPERIORITY: `[<:Superiority:1517631048945504396>](https://supitstom.net/teapot-bot/badges/#superiority)`,
  BADGE_PREMIUM: `[<:Premium:1517631046852546610>](https://supitstom.net/teapot-bot/badges/#premium)`,
  BADGE_TESTER: `[<:Tester:1517633913734955090>](https://supitstom.net/teapot-bot/badges/#tester)`,
  BADGE_CLAN_MEMBER: `[<:ClanMember:1517631029320355932>](https://supitstom.net/teapot-bot/badges/#clan-member)`,

  // New
  BADGE_UNICORN: `[<:Unicorn:1531795665217126523>](https://supitstom.net/teapot-bot/badges/#unicorn)`,
};

// rendered on profile in order here
const DatabaseBadgeMap = Object.freeze([
  {
    flag: UserFlags.BADGE_DEVELOPER,
    badge: ProfileCardBadges.BADGE_DEVELOPER,
  },
  {
    flag: UserFlags.BUG_HUNTER,
    badge: ProfileCardBadges.BADGE_TESTER,
  },
  {
    flag: UserFlags.BADGE_SUPERIORITY,
    badge: ProfileCardBadges.BADGE_SUPERIORITY,
  },
  {
    flag: UserFlags.BADGE_UNICORN,
    badge: ProfileCardBadges.BADGE_UNICORN,
  },
  
]);

export class Badges {
  constructor(env, discord_user) {
    this.env = env;
    this.discord_user = discord_user;
  }

  async GetAll() {
    const bot_user = await new TeapotBot(this.env).GetUser(this.discord_user);

    const teapot = await postTeapotRequest(this.env, {
      action: "overview",
      email: bot_user.email,
    });

    // Database-backed badges
    const databaseBadges = DatabaseBadgeMap
      .filter(({ flag }) => hasFlag(bot_user.flags ?? 0, flag))
      .map(({ badge }) => badge)
      .join(" ");

    // Dynamic badges
    const isLifetime = teapot.user.timeleft.lifetime
      ? ProfileCardBadges.BADGE_LIFETIME
      : "";

    const isPremium = teapot.user.timeleft.premium
      ? ProfileCardBadges.BADGE_PREMIUM
      : "";

    const isClanMember =
      this.discord_user.primary_guild &&
        this.discord_user.primary_guild.identity_enabled &&
        this.discord_user.primary_guild.identity_guild_id ===
        "1004811174044508271"
        ? ProfileCardBadges.BADGE_CLAN_MEMBER
        : "";

    /*
     * Future badges:
     *
     * BADGE_SYSTEM
     *   - Child webhook of the App
     *   - The App itself
     *
     * BADGE_STAFF
     *   - Discord Team member
     *   - Support server staff
     *
     * BADGE_APP_TESTER
     *   - Discord application tester
     */

    // if (this.env.DISCORD_APPLICATION.CLIENT_ID !== "1447678850493321288") {
    //   return "`ⓘ Badges disabled`";
    // }

    return [
      databaseBadges,
      isClanMember,
      isLifetime,
      isPremium,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }
}
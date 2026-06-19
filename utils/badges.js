import { postTeapotRequest, TeapotBot } from "./teapot";
import { badges } from "../metadata/badges.json";
import { IsStaging } from "./client";


export const ProfileCardBadges = {
  BADGE_SYSTEM: `[<:System:1517325729467990178>](https://supitstom.net/teapot-bot/badges/#system)`,
  BADGE_DEVELOPER: `[<:Developer:1517325727366778880>](https://supitstom.net/teapot-bot/badges/#developer)`,//
  BADGE_LIFETIME: `[<:Lifetime:1517324471176790047>](https://supitstom.net/teapot-bot/badges/#lifetime)`,//
  BADGE_MOXAH: `[<:Moxah:1517324474364723365>](https://supitstom.net/teapot-bot/badges/#moxah)`,//
  BADGE_PH: `[<:Contributor:1517324468832309328>](https://supitstom.net/teapot-bot/badges/#slut)`,//
  BADGE_KALI: `[<:Bricker:1517324465548034129>](https://supitstom.net/teapot-bot/badges/#bricker)`,//
  BADGE_SUPERIORITY: `[<:Superiority:1517324477547937862>](https://supitstom.net/teapot-bot/badges/#superiority)`,//
  BADGE_PREMIUM: `[<:Premium:1517324476142850210>](https://supitstom.net/teapot-bot/badges/#premium)`,//
  BADGE_TESTER: `[<:Tester:1517325730919481434>](https://supitstom.net/teapot-bot/badges/#tester)`,//
  BADGE_CLAN_MEMBER: `[<:ClanMember:1517324467456577677>](https://supitstom.net/teapot-bot/badges/#clan-member)`,//
}

export class Badges {
  constructor(env, discord_user) {
    this.env = env;
    this.discord_user = discord_user;
  }

  async GetAll() {
    const bot_user = await new TeapotBot(this.env).GetUser(this.discord_user);
    const teapot = await postTeapotRequest(this.env, { action: "overview", email: `${bot_user.email}` });


    // shit hacky way to fix undefined users in badge metadata
    let isSystem = ``;
    let isDeveloper = ``;
    let isSuperiority = ``;
    let isMoxah = ``;
    let isSlut = ``;
    let isBricker = ``;
    let isTester = ``;

    // IF: user does exist in metadata
    if (badges[this.discord_user.id] != undefined) {
      isSystem = badges[this.discord_user.id].includes("system") == true ? `${ProfileCardBadges.BADGE_SYSTEM} ` : ``;
      isDeveloper = badges[this.discord_user.id].includes("developer") == true ? `${ProfileCardBadges.BADGE_DEVELOPER} ` : ``;

      // static user groups
      isSuperiority = badges[this.discord_user.id].includes("superiority") == true ? `${ProfileCardBadges.BADGE_SUPERIORITY} ` : ``;
      isMoxah = badges[this.discord_user.id].includes("moxah") == true ? `${ProfileCardBadges.BADGE_MOXAH} ` : ``;
      isSlut = badges[this.discord_user.id].includes("slut") == true ? `${ProfileCardBadges.BADGE_PH} ` : ``;
      isBricker = badges[this.discord_user.id].includes("brick") == true ? `${ProfileCardBadges.BADGE_KALI} ` : ``;
      isTester = badges[this.discord_user.id].includes("tester") == true ? `${ProfileCardBadges.BADGE_TESTER} ` : ``;
    }

    // non-static

    /*
    * TODO:
    *
    * isSystem    =>  User is a child webhook of the App
    *             =>  User is the App itself
    * 
    * isStaff     =>  User is a member of the Team which owns the App (portal->team)
    *                 User has Staff roles in Support server (server)
    * 
    * isDeveloper =>  User has DEVELOPER flag in team roster (portal->team)
    *                 User is a whitelisted Repo contributor (github)
    * 
    * isAppTester =>  User is a whitelisted App tester (portal)
    * 
    */
    const isLifetime = teapot.user.timeleft.lifetime == true ? `${ProfileCardBadges.BADGE_LIFETIME} ` : ``;
    const isPremium = teapot.user.timeleft.premium == true ? `${ProfileCardBadges.BADGE_PREMIUM} ` : ``;
    const isClanMember = this.discord_user.primary_guild && this.discord_user.primary_guild.identity_enabled && this.discord_user.primary_guild.identity_guild_id == "1004811174044508271" ? `${ProfileCardBadges.BADGE_CLAN_MEMBER} ` : ``;

    if( this.env.DISCORD_APPLICATION.CLIENT_ID !== "1447678850493321288") return `\`ⓘ Badges disabled\``;

    return `${isSystem}${isDeveloper}${isTester}${isSuperiority}${isMoxah}${isSlut}${isBricker}${isClanMember}${isLifetime}${isPremium}`;
  }
}

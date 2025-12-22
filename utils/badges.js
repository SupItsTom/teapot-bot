import { postTeapotRequest, TeapotBot } from "./teapot";
import { badges } from "../metadata/badges.json";
import { IsStaging } from "./client";


export const ProfileCardBadges = {
  BADGE_SYSTEM: `[<:System:1447729866190487716>](https://supitstom.net/teapot-bot/badges/#system)`,
  BADGE_DEVELOPER: `[<:Developer:1447729859261632634>](https://supitstom.net/teapot-bot/badges/#developer)`,//
  BADGE_LIFETIME: `[<:Lifetime:1447729860549283841>](https://supitstom.net/teapot-bot/badges/#lifetime)`,//
  BADGE_MOXAH: `[<:Moxah:1447729862017155293>](https://supitstom.net/teapot-bot/badges/#moxah)`,//
  BADGE_PH: `[<:Contributor:1447729857952743506>](https://supitstom.net/teapot-bot/badges/#slut)`,//
  BADGE_KALI: `[<:TopBricker:1447729855050551447>](https://supitstom.net/teapot-bot/badges/#bricker)`,//
  BADGE_SUPERIORITY: `[<:Superiority:1447729865100099634>](https://supitstom.net/teapot-bot/badges/#superiority)`,//
  BADGE_PREMIUM: `[<:Premium:1447729863568920588>](https://supitstom.net/teapot-bot/badges/#premium)`,//
  BADGE_TESTER: `[<:Tester:1447729867486396597>](https://supitstom.net/teapot-bot/badges/#tester)`,//
  BADGE_CLAN_MEMBER: `[<:ClanMember:1447729856610701373>](https://supitstom.net/teapot-bot/badges/#clan-member)`,//
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
    const isLifetime = teapot.user.timeleft.lifetime == true ? `${ProfileCardBadges.BADGE_LIFETIME} ` : ``;
    const isPremium = teapot.user.timeleft.premium == true ? `${ProfileCardBadges.BADGE_PREMIUM} ` : ``;

    //const isClanMember = this.discord_user.primary_guild.identity_enabled && this.discord_user.primary_guild.identity_guild_id == "1004811174044508271" ? `${ProfileCardBadges.BADGE_CLAN_MEMBER} ` : ``;
    

    // return the formatted string of badges the user has:
    if (badges[this.discord_user.id]) {
      console.log(`Badges:GetAll: Badges claimed by user ${this.discord_user.id}:`);
      badges[this.discord_user.id].forEach(badge => console.log(` - ${badge}`));
    }
    else console.log(`Badges:GetAll: No claimed badges for user ${this.discord_user.id}:`);
    

    if( this.env.DISCORD_APPLICATION.CLIENT_ID !== "1447678850493321288") return `\`ⓘ Badges disabled due to env\``;

    return `${isSystem}${isDeveloper}${isTester}${isSuperiority}${isMoxah}${isSlut}${isBricker}${isLifetime}${isPremium}`;
  }
}

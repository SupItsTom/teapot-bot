import { postTeapotRequest, TeapotBot } from "./teapot";
import { UserFlags, hasFlag } from "./flags";

export function ProfileCardBadges(env) {
	return {
		BADGE_SYSTEM: `[${env.DISCORD_EMOJI.BADGE_SYSTEM}](https://supitstom.net/teapot-bot/badges/#system)`,
		BADGE_DEVELOPER: `[${env.DISCORD_EMOJI.BADGE_DEVELOPER}](https://supitstom.net/teapot-bot/badges/#developer)`,
		BADGE_BUG_HUNTER: `[${env.DISCORD_EMOJI.BADGE_BUG_HUNTER}](https://supitstom.net/teapot-bot/badges/#bug-hunter)`,
		BADGE_SUPERIORITY: `[${env.DISCORD_EMOJI.BADGE_SUPERIORITY}](https://supitstom.net/teapot-bot/badges/#superiority)`,
		BADGE_CLAN_MEMBER: `[${env.DISCORD_EMOJI.BADGE_CLAN_MEMBER}](https://supitstom.net/teapot-bot/badges/#clan-member)`,
		BADGE_PREMIUM: `[${env.DISCORD_EMOJI.BADGE_PREMIUM}](https://supitstom.net/teapot-bot/badges/#premium)`,
		BADGE_UNICORN: `[${env.DISCORD_EMOJI.BADGE_UNICORN}](https://supitstom.net/teapot-bot/badges/#unicorn)`,
		BADGE_LIFETIME: `[${env.DISCORD_EMOJI.BADGE_LIFETIME}](https://supitstom.net/teapot-bot/badges/#lifetime)`,
		BADGE_PLACEHOLDER: `[${env.DISCORD_EMOJI.BADGE_PLACEHOLDER}](https://supitstom.net/teapot-bot/badges/#placeholder)`,
	};
}

export class Badges {
	constructor(env, discord_user) {
		this.env = env;
		this.discord_user = discord_user;
		this.badges = ProfileCardBadges(env);
	}

	async GetAll() {
		const bot_user = await new TeapotBot(this.env).GetUser(this.discord_user);

		const teapot = await postTeapotRequest(this.env, {
			action: "overview",
			email: bot_user.email,
		});

		const DatabaseBadgeMap = Object.freeze([
			{
				flag: UserFlags.STAFF,
				badge: this.badges.BADGE_DEVELOPER,
			},
			{
				flag: UserFlags.BUG_HUNTER,
				badge: this.badges.BADGE_BUG_HUNTER,
			},
			{
				flag: UserFlags.BADGE_SUPERIORITY,
				badge: this.badges.BADGE_SUPERIORITY,
			},
			{
				flag: UserFlags.BADGE_UNICORN,
				badge: this.badges.BADGE_UNICORN,
			},
		]);

		const databaseBadges = DatabaseBadgeMap
			.filter(({ flag }) => hasFlag(bot_user.flags ?? 0, flag))
			.map(({ badge }) => badge)
			.join(" ");

		const isLifetime = teapot.user.timeleft.lifetime
			? this.badges.BADGE_LIFETIME
			: "";

		const isPremium = teapot.user.timeleft.premium
			? this.badges.BADGE_PREMIUM
			: "";

		const isClanMember =
			this.discord_user.primary_guild &&
			this.discord_user.primary_guild.identity_enabled &&
			this.discord_user.primary_guild.identity_guild_id ===
				"1004811174044508271"
				? this.badges.BADGE_CLAN_MEMBER
				: "";

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
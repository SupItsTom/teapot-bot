import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { IsStaging, JsonResponse, numberWithCommas, truncateRelativeTime } from "../utils/client";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl, Discord, AppWebhookEventType, getBannerUrl } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserAvatarType, UserBannerType } from "../utils/teapot";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";

import mod_onboarding_logon, { mod_onboarding_logon_submitted } from "../modals/mod_onboarding_logon";

/**
 * # Profile Command
 * Fetch and display the user's profile information
 */
export default async function (interaction, env, ctx) {

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });
  const teapot_kv = await postTeapotRequest(env, { action: "kvstatus", email: `${bot_user.email}` });

  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);
  let _profile_badges = await new Badges(env, discord_user).GetAll();

  if (
    interaction.guild_id === env.DISCORD_APPLICATION.GUILD_ID &&
    !bot_user.settings.private &&
    bot_user.settings.render_details &&
    teapot_kv.time != ""
  ) {
    await new Discord(env).SendWebhookEvent(AppWebhookEventType.USER_VAULT_LOG,
      `-# **[${discord_user.username}](discord://-/users/${discord_user.id})** has been unbanned for **${truncateRelativeTime(teapot_kv.time)}**.`
    );
  }

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags:
        InteractionResponseFlags.IS_COMPONENTS_V2 |
        (bot_user.settings.private ? InteractionResponseFlags.EPHEMERAL : 0),

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**PROFILE**`, -1),

            ..._profileComponent({ bot_user, discord_user, teapot, _game_info, _profile_badges, }),

            ...(bot_user.settings.render_details || bot_user.settings.private
              ? [
                MessageComponent.Seperator(),

                MessageComponent.Text(`
-# **DETAILS**
**Gamertag:** ${teapot.user.gamertag == "" ? "Not Signed In" : `${teapot.user.gamertag}`}
**Challenges:** ${numberWithCommas(teapot.user.xke_count)}
**Time Left:** ${teapot.user.timeleft.lifetime == true ? `Lifetime${teapot.user.timeleft.premium == true ? " (Premium)" : ""}` : `${teapot.user.timeleft.banked.days}d ${teapot.user.timeleft.banked.timeleft}`}
**Keyvault Time:** ${teapot_kv.time == "" ? "Not set" : `${truncateRelativeTime(teapot_kv.time)}`}
`),
              ]
              : []),

            MessageComponent.Seperator(),

            _memberYearsOfService(teapot, bot_user)
          ]
        },
        ...(env.CF_VERSION_METADATA.id === ''
          ? [
            {
              type: MessageComponentTypes.CONTAINER,
              components: [
                MessageComponent.Text(`**PROFILE DEBUG**`, -1),
                MessageComponent.Text(
                  "```json\n" + JSON.stringify(bot_user, null, 2) + "\n```"
                ),
              ]
            }
          ]: []),
      ]
    }
  });
}

// Return Member Since component, with tenure if available for user
function _memberYearsOfService(teapot, bot_user) {
  const years = Math.floor(
    (Date.now() / 1000 - teapot.user.date_registered_unix) /
    (60 * 60 * 24 * 365.25)
  );

  if (teapot.user.date_registered_unix === 920950991) {
    return MessageComponent.Text(`
-# **MEMBER SINCE**
-# <:TeapotLive:1517630995988480020> Legacy Account **•** <:TeapotBot:1517630993899589802> <t:${Math.floor(new Date(bot_user.timestamp).getTime() / 1000)}:D>
`);
  }

  if (years <= 0) {
    return MessageComponent.Text(`
-# **MEMBER SINCE**
-# <:TeapotLive:1517630995988480020> <t:${teapot.user.date_registered_unix}:D> **•** <:TeapotBot:1517630993899589802> <t:${Math.floor(new Date(bot_user.timestamp).getTime() / 1000)}:D>
`);
  }

  return {
    type: ComponentType.Section,
    components: [
      MessageComponent.Text(`
-# **MEMBER SINCE**
-# <:TeapotLive:1517630995988480020> <t:${teapot.user.date_registered_unix}:D> **•** <:TeapotBot:1517630993899589802> <t:${Math.floor(new Date(bot_user.timestamp).getTime() / 1000)}:D>
`)
    ],
    accessory: {
      type: MessageComponentTypes.BUTTON,
      label: `${years} Year${years !== 1 ? "s" : ""} of Service`,
      style: ButtonStyle.Secondary,
      custom_id: `btn_readonly-${bot_user.id}-tenure`,
      disabled: true,
    },
  };
}

// get profile component
export function _profileComponent({
  bot_user,
  discord_user,
  teapot,
  _game_info,
  _profile_badges,
}) {
  const profileComponents = [
    MessageComponent.Text(
      `<@${discord_user.id}> \`${teapot.user.name}\``,
      2
    ),

    MessageComponent.Text(
      `${teapot.user.online === true
        ? `**${teapot.user.title.name === "None Set"
          ? "Currently Online"
          : `Playing [${_game_info.name}](https://dbox.tools/marketplace/products/${_game_info.bing_id})`
        }**`
        : `**Last Seen <t:${teapot.user.date_lastseen_unix}:R>${teapot.user.title.name === "None Set"
          ? ""
          : ` on [${_game_info.name}](https://dbox.tools/marketplace/products/${_game_info.bing_id})`
        }**`
      }`,
      -1
    ),

    ...(_profile_badges
      ? [MessageComponent.Text(`${_profile_badges}`, 1)]
      : []),
  ];

  const avatarType = bot_user.settings.avatar_type;

  if (avatarType === UserAvatarType.DISABLED) {
    // return no section component
    return [
      ..._resolveBanner(),
      ...profileComponents,
    ];
  }

  const avatarUrl = ({
    [UserAvatarType.XBOX_GAMERPIC]:
      `http://avatar.xboxlive.com/avatar/${encodeURIComponent(teapot.user.gamertag.trim())}/avatarpic-l.png`,

    [UserAvatarType.DISCORD_AVATAR]:
      getAvatarUrl(discord_user),
  })[avatarType];

  const section = {
    type: ComponentType.Section,
    components: profileComponents,
    accessory: {
      type: ComponentType.Thumbnail,
      media: {
        url: avatarUrl,
      },
    },
  };

  return [
    ..._resolveBanner(),
    section,
  ];

  function _resolveBanner() {
    const bannerType = bot_user.settings.banner_type;

    if (bannerType === UserBannerType.DISABLED) {
      return [];
    }

    const bannerUrl = ({
      [UserBannerType.XBOX_GAME_BANNER]:
        _game_info &&
          _game_info.bing_id &&
          teapot.user.title.id !== "0xFFFE07D1"
          ? `http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`
          : null,

      [UserBannerType.DISCORD_BANNER]:
        getBannerUrl(discord_user),
    })[bannerType];

    if (!bannerUrl) return [];

    return [
      MessageComponent.Media(bannerUrl, {
        description:
          bannerType === UserBannerType.XBOX_GAME_BANNER
            ? `Game banner for '${_game_info.name}'`
            : "Profile banner",
      }),
    ];
  }
}

// Dev: returns database objects
function __dev_user_json(teapot, bot_user) {
  return [
    {
      type: MessageComponentTypes.CONTAINER,
      components: [
        MessageComponent.Text(`**PROFILE DEBUG**`, -1),
        MessageComponent.Text(
          "```json\n" + JSON.stringify(bot_user, null, 2) + "\n```"
        ),
      ]
    }
  ];
}
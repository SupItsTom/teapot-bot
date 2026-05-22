import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { bannerTypeLabel, postTeapotRequest, TeapotBot, UserBannerType } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import { TA_MadMan } from "../textadventure/ta_madman";

import mod_onboarding_logon, { mod_onboarding_logon_submitted } from "../modals/mod_onboarding_logon";

import { _renderSettings } from "../commands/cmd_settings";

/**
 * # Change Banner Modal
 * Modal to change a users banner preference
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      "title": `Banner Preference`,
      "custom_id": 'mod_settings_change_banner',
      "components": [
        {
          "type": ComponentType.Label,
          "label": "What will it be?",
          "component": {
            "type": ComponentType.RadioGroup,
            "custom_id": "mod_settings_change_banner:type",
            "options": [
              {
                "value": "XBOX_GAME_BANNER",
                "label": `${bannerTypeLabel(UserBannerType.XBOX_GAME_BANNER)}`,
                "default": bot_user.settings.banner_type === UserBannerType.XBOX_GAME_BANNER
              },
              // {
              //   "value": "DISCORD_BANNER",
              //   "label": `${bannerTypeLabel(UserBannerType.DISCORD_BANNER)}`,
              //   "default": bot_user.settings.banner_type === UserBannerType.DISCORD_BANNER
              // },
              {
                "value": "DISABLED",
                "label": `${bannerTypeLabel(UserBannerType.DISABLED)}`,
                "default": bot_user.settings.banner_type === UserBannerType.DISABLED
              },
            ]
          }
        }
      ]
    }
  });
}

export async function mod_settings_change_banner_submitted(interaction, env, ctx) {
  console.log(
    `[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`
  );

  const _banner_setting_requested =
    interaction.data.components[0].component.value;

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  switch (_banner_setting_requested) {
    case "XBOX_GAME_BANNER":
      await new TeapotBot(env).UpdateSettings(discord_user, {
        banner_type: UserBannerType.XBOX_GAME_BANNER,
      });
      break;

    case "DISCORD_BANNER":
      await new TeapotBot(env).UpdateSettings(discord_user, {
        banner_type: UserBannerType.DISCORD_BANNER,
      });
      break;

    case "DISABLED":
      await new TeapotBot(env).UpdateSettings(discord_user, {
        banner_type: UserBannerType.DISABLED,
      });
      break;

    default:
      console.warn(
        `[${InteractionType[interaction.type]}]: invalid banner type: ${_banner_setting_requested}`
      );
      break;
  }

  const bot_user_refresh = await new TeapotBot(env).GetUser(discord_user);
  const teapot_refresh = await postTeapotRequest(env, {
    action: "overview",
    email: bot_user.email,
  });

  return new JsonResponse({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      allowed_mentions: { parse: [] },
      flags:
        InteractionResponseFlags.IS_COMPONENTS_V2 |
        InteractionResponseFlags.EPHEMERAL,
      components: [
        ...(await _renderSettings(
          teapot_refresh,
          bot_user_refresh,
          "sel_settings_preference"
        )),
      ],
    },
  });
}
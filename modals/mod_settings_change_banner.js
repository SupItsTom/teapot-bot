import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserBannerType } from "../utils/teapot";
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
              { "value": "last_played", "label": "Last Played Game", "default": bot_user.settings.banner_type === UserBannerType.LAST_PLAYED },
              { "value": "discord", "label": "Discord Banner", "default": bot_user.settings.banner_type === UserBannerType.DISCORD },
            ]
          }
        }
      ]
    }
  });
}

export async function mod_settings_change_banner_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  const _banner_setting_requested = interaction.data.components[0].component.value;

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  await new TeapotBot(env).UpdateSettings(discord_user, {
    banner_type: _banner_setting_requested === "last_played" ? UserBannerType.LAST_PLAYED : UserBannerType.DISCORD
  })

  // fetch new data, not needed if it doesn't update the server account
  const bot_user_refresh = await new TeapotBot(env).GetUser(discord_user);
  const teapot_refresh = await postTeapotRequest(env, { action: "overview", email: bot_user.email });

  // refreshes the settings component like a madman
  return new JsonResponse({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
      components: [
        ...await _renderSettings(teapot_refresh, bot_user_refresh, "sel_settings_preference")
      ]
    }
  });
}
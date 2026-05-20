import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import { TA_MadMan } from "../textadventure/ta_madman";

import mod_onboarding_logon, { mod_onboarding_logon_submitted } from "../modals/mod_onboarding_logon";

import { _renderSettings } from "../commands/cmd_settings";

/**
 * # Change Username Modal
 * Modal to change a users username
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  await console.log(bot_user)

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      "title": `Profile Privacy`,
      "custom_id": 'mod_settings_change_privacy',
      "components": [
        {
          "type": ComponentType.Label,
          "label": "Who can see your profile?",
          "component": {
            "type": ComponentType.RadioGroup,
            "custom_id": "mod_settings_change_privacy:type",
            "options": [
              { "value": "public", "label": "Everyone on Discord", "description": "Your profile is visible to Server Members in commands you use.", "default": !bot_user.is_private },
              { "value": "private", "label": "Only Me", "description": "Your profile will only be visible to you in commands you use.", "default": bot_user.is_private },
            ]
          }
        },
        {
          "type": ComponentType.TextDisplay,
          "content": "-# Reguardless of your privacy setting, we will never disclose potentially sensitive information, such as your email or console CPU Key."
        }
      ]
    }
  });
}

export async function mod_settings_change_privacy_submitted(interaction, env, ctx) {
  const _privacy_setting_requested = interaction.data.components[0].component.value;

  await console.log(interaction.data.components[0].component.value)

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  await new TeapotBot(env).UpdatePrivacy(discord_user, _privacy_setting_requested === "private" ? true : false)

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
        ...await _renderSettings(teapot_refresh, bot_user_refresh, "sel_settings_general")
      ]
    }
  });
}
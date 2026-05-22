import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import { TA_MadMan } from "../textadventure/ta_madman";

import mod_onboarding_logon, { mod_onboarding_logon_submitted } from "../modals/mod_onboarding_logon";

import { _renderSettings } from "../commands/cmd_settings";

/**
 * # Change Email Modal
 * Modal to change a users email
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
      "title": `Change your email`,
      "custom_id": 'mod_settings_change_email',
      "components": [
        {
          "type": ComponentType.Label,
          "label": 'Email',
          "component": {
            "type": MessageComponentTypes.INPUT_TEXT,
            "custom_id": 'mod_settings_change_email:email',
            "style": TextInputStyle.Short,
            "min_length": 3,
            "max_length": 254,
            "value": `${bot_user.email}`,
            "placeholder": `${bot_user.email}`,
            "required": true
          }
        },
      ]
    }
  });
}

export async function mod_settings_change_email_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  const _email_requested = interaction.data.components[0].component.value;

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  // todo: set new email

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
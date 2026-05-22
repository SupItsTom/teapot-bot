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
 * # Toggle Notifications Modal
 * Modal to change a users notific ation preference
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
      "title": `Notifications Preference`,
      "custom_id": 'mod_settings_toggle_notifications',
      "components": [
        {
          "type": ComponentType.Label,
          "label": "System Notifications",
          "component": {
            "type": ComponentType.CheckboxGroup,
            "custom_id": "mod_settings_toggle_notifications:general",
            "min_values": 0,
            "max_values": 3,
            "required": false,
            "options": [
              { "value": "welcome", "label": "Welcome Notification", "description": "", "default": teapot.user.options.xnotify.welcome },
              { "value": "xamchal", "label": "XAM Challenge Passed", "description": "", "default": teapot.user.options.xnotify.xamchal },
              { "value": "xoschal", "label": "XOS Challenge Passed", "description": "", "default": teapot.user.options.xnotify.xoschal },
            ]
          }
        },
        {
          "type": ComponentType.TextDisplay,
          ...teapot.user.online ? {
            "content": "-# **YOUR CONSOLE IS ON**\n-# Changes will be applied next time you reboot your console."
          } : {
            "content": "-# **YOUR CONSOLE IS OFF**\n-# Changes will be applied next time you turn on your console."
          }
        }
      ]
    }
  });
}

export async function mod_settings_toggle_notifications_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  const _notify_welcome_request = interaction.data.components[0].component.values.includes("welcome");
  const _notify_xamchal_request = interaction.data.components[0].component.values.includes("xamchal");
  const _notify_xoschal_request = interaction.data.components[0].component.values.includes("xoschal");

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);
  const teapot = await postTeapotRequest(env, { action: "overview", email: bot_user.email });

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const _current_engines = Object.values(teapot.user.options.engines)
  .reduce((acc, [name, enabled]) => {
    acc[name] = enabled ? 1 : 0;
    return acc;
  }, {});

  const teapot_data = await postTeapotRequest(env, {
    action: "setdata",
    subaction: "setoptions",
    email: bot_user.email,

    N_WELCOME: _notify_welcome_request ? 1 : 0,
    N_XAM: _notify_xamchal_request ? 1 : 0,
    N_XOSC: _notify_xoschal_request ? 1 : 0,

    ..._current_engines
  });

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
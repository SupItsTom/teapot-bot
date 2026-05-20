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
 * # Change Colors Modal
 * Modal to change a users console colors
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  // note: can only display max of 5 text input's per modal
  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      "title": `Color Preference`,
      "custom_id": 'mod_settings_change_colors',
      "components": [
        {
          "type": ComponentType.TextDisplay,
          "content": "-# **PREVIEW ONLY:**\n-# This content is currently read-only. Any changes will not be saved."
        },
        {
          "type": ComponentType.Label,
          "label": "Dashboard Background",
          "component": {
            "type": ComponentType.TextInput,
            "custom_id": "mod_settings_change_colors:dashbg",
            "style": 1,
            "min_length": 0,
            "max_length": 6,
            "placeholder": `${teapot.user.colors.dashbg.substring(2)}`,
            "value": `${teapot.user.colors.dashbg.substring(2)}`,
            "required": false
          }
        },
        
      ]
    }
  });
}

export async function mod_settings_change_colors_submitted(interaction, env, ctx) {
  const _engine_mw2_request = interaction.data.components[0].component.values.includes("mw2");
  const _engine_bo2_request = interaction.data.components[0].component.values.includes("bo2");
  const _engine_mw3_request = interaction.data.components[0].component.values.includes("mw3");
  const _engine_bo1_request = interaction.data.components[0].component.values.includes("bo1");
  const _engine_ghosts_request = interaction.data.components[0].component.values.includes("ghosts");
  const _engine_aw_request = interaction.data.components[0].component.values.includes("aw");
  const _engine_bo3_request = interaction.data.components[0].component.values.includes("bo3");
  const _engine_waw_request = interaction.data.components[0].component.values.includes("waw");
  const _engine_cod4_request = interaction.data.components[0].component.values.includes("cod4");

  await console.log(interaction.data.components[0].component.value)

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);
  const teapot = await postTeapotRequest(env, { action: "overview", email: bot_user.email });

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot_data = await postTeapotRequest(env, {
    action: "setdata",
    subaction: "setoptions",
    email: bot_user.email,

    N_WELCOME: teapot.user.options.xnotify.welcome ? 1 : 0,
    N_XAM: teapot.user.options.xnotify.xamchal ? 1 : 0,
    N_XOSC: teapot.user.options.xnotify.xoschal ? 1 : 0,

    MW2: _engine_mw2_request ? 1 : 0,
    BO2: _engine_bo2_request ? 1 : 0,
    MW3: _engine_mw3_request ? 1 : 0,
    BO1: _engine_bo1_request ? 1 : 0,
    GHOSTS: _engine_ghosts_request ? 1 : 0,
    AW: _engine_aw_request ? 1 : 0,
    BO3: _engine_bo3_request ? 1 : 0,
    WAW: _engine_waw_request ? 1 : 0,
    COD4: _engine_cod4_request ? 1 : 0,
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
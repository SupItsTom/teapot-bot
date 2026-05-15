import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import mod_signin from "./mod_signin";
import { TA_MadMan } from "../textadventure/ta_madman";
import { _renderSettings } from "../commands/cmd_settings";

/**
 * # Change Username Modal
 * Modal to change a users username
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      "title": `Cheat Engine Preference`,
      "custom_id": 'mod_settings_toggle_cheats',
      "components": [
        {
          "type": ComponentType.Label,
          "label": "Cheat Engines",
          "component": {
            "type": ComponentType.CheckboxGroup,
            "custom_id": "mod_settings_toggle_cheats:general",
            "min_values": 0,
            "max_values": 9,
            "required": false,
            "options": [
              { "value": "mw2", "label": "Modern Warfare 2", "description": "", "default": teapot.user.options.engines["41560817"][1] },
              { "value": "bo2", "label": "Black Ops 2", "description": "", "default": teapot.user.options.engines["415608C3"][1] },
              { "value": "bo1", "label": "Black Ops 1", "description": "", "default": teapot.user.options.engines["41560855"][1] },
              { "value": "mw3", "label": "Modern Warfare 3", "description": "", "default": teapot.user.options.engines["415608CB"][1] },
              { "value": "ghosts", "label": "Ghosts", "description": "", "default": teapot.user.options.engines["415608FC"][1] },
              { "value": "aw", "label": "Advanced Warfare", "description": "", "default": teapot.user.options.engines["41560914"][1] },
              { "value": "bo3", "label": "Black Ops 3", "description": "", "default": teapot.user.options.engines["4156091D"][1] },
              { "value": "waw", "label": "World at War", "description": "", "default": teapot.user.options.engines["4156081C"][1] },
              { "value": "cod4", "label": "Call of Duty 4", "description": "", "default": teapot.user.options.engines["415607E6"][1] },
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

export async function mod_settings_toggle_cheats_submitted(interaction, env, ctx) {
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
    return mod_signin(interaction, env, ctx);
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
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { ClientError, getDiscordUser } from "../utils/discord";
import { TeapotBot } from "../utils/teapot";
import { AutoComplete } from "../utils/autocomplete";
import { TA_MadMan } from "../textadventure/ta_madman";

import cmd_files from "../commands/cmd_files";
import cmd_quote from "../commands/cmd_quote";
import cmd_profile from "../commands/cmd_profile";
import cmd_status from "../commands/cmd_status";
import cmd_token from "../commands/cmd_token";
import cmd_settings from "../commands/cmd_settings";
import cmd_store from "../commands/cmd_store";
import mod_signin, { mod_signin_submitted } from "../modals/mod_signin";

import btn_remove_console from "../components/btn_remove_console";

import { global_blacklist } from "../metadata/blacklist.json";

import mod_settings_change_username, { mod_settings_change_username_submitted } from "../modals/mod_settings_change_username";
import mod_settings_change_privacy, { mod_settings_change_privacy_submitted } from "../modals/mod_settings_change_privacy";
import mod_settings_remove_console, { mod_settings_remove_console_submitted } from "../modals/mod_settings_remove_console";
import mod_settings_change_avatar, { mod_settings_change_avatar_submitted } from "../modals/mod_settings_change_avatar";
import mod_settings_change_banner, { mod_settings_change_banner_submitted } from "../modals/mod_settings_change_banner";
import mod_settings_toggle_notifications, { mod_settings_toggle_notifications_submitted } from "../modals/mod_settings_toggle_notifications";
import mod_settings_toggle_cheats, { mod_settings_toggle_cheats_submitted } from "../modals/mod_settings_toggle_cheats";
import mod_settings_change_colors, { mod_settings_change_colors_submitted } from "../modals/mod_settings_change_colors";


//-----------------------------------------------------------------------------
// Purpose: Entry point to handle various command types
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
  const interaction = await request.json();

  console.info(`[endpoints:interactions] incoming request for ${InteractionType[interaction.type]}`);
  //console.log(`${JSON.stringify(interaction)}`);

  const discord_user = await getDiscordUser(interaction);

  if (global_blacklist.includes(discord_user.id)) {
    return new ClientError(`Unauthorized`, "This Discord User is not authorized to use this application.").ShowUser()
  }

  switch (interaction.type) {
    case InteractionType.PING: {
      return _handlePingRequest();
    }
    case InteractionType.APPLICATION_COMMAND: {
      return _handleApplicationCommand(interaction, env, ctx);
    }
    case InteractionType.MODAL_SUBMIT: {
      return _handleModalSubmit(interaction, env, ctx);
    }
    case InteractionType.MESSAGE_COMPONENT: {
      return _handleMessageComponent(interaction, env, ctx);
    }
    case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
      return _handleApplicationCommandAutoComplete(interaction, env, ctx)
    }
    default: {
      return dropRequest(400);
    }
  }
}

//-----------------------------------------------------------------------------
// Purpose: Let's Discord know we are alive
//-----------------------------------------------------------------------------
function _handlePingRequest() {
  return new JsonResponse({ type: InteractionResponseType.PONG });
}

//-----------------------------------------------------------------------------
// Purpose: Main handler for directing commands to right place
//-----------------------------------------------------------------------------
function _handleApplicationCommand(interaction, env, ctx) {
  console.log(`[endpoints:interactions][_handleApplicationCommand]: ${interaction.data.name}`)

  const cmdName = interaction.data.name.toLowerCase();

  switch (cmdName) {
    case "files": return cmd_files(interaction, env, ctx);
    case "quote": return cmd_quote(interaction, env, ctx);
    case "status": return cmd_status(interaction, env, ctx);
    case "token": return cmd_token(interaction, env, ctx);
    case "profile": return cmd_profile(interaction, env, ctx);
    case "link": return mod_signin(interaction, env, ctx);
    case "settings": return cmd_settings(interaction, env, ctx);
    case "store": return cmd_store(interaction, env, ctx);

    default: return new ClientError("Command Not Found", `The command \`${cmdName}\` is not available in this build.`).ShowUser();
  }
}

//-----------------------------------------------------------------------------
// Purpose: Handles command autocomplete results
//-----------------------------------------------------------------------------
function _handleApplicationCommandAutoComplete(interaction, env, ctx) {
  console.log(`[endpoints:interactions][_handleApplicationCommandAutoComplete]: ${interaction.data.name}`)

  const cmdName = interaction.data.name.toLowerCase();

  switch (cmdName) {
    case "store": return new AutoComplete(interaction).StoreGetTitleIds(interaction.data.options[0].value);
    default: return new ClientError("AutoComplete Error", `AutoComplete failed to populate fields for \`${cmdName}\`.`).ShowUser();
  }
}

//-----------------------------------------------------------------------------
// Purpose: Handles submitted modals
//-----------------------------------------------------------------------------
function _handleModalSubmit(interaction, env, ctx) {
  console.log(`[endpoints:interactions][_handleModalSubmit]: ${interaction.data.custom_id}`)

  const modName = interaction.data.custom_id.toLowerCase();

  switch (modName) {
    case "mod_signin": return mod_signin_submitted(interaction, env, ctx);

    // NEW
    case "mod_settings_change_username": return mod_settings_change_username_submitted(interaction, env, ctx);
    case "mod_settings_change_privacy": return mod_settings_change_privacy_submitted(interaction, env, ctx);
    case "mod_settings_remove_console": return mod_settings_remove_console_submitted(interaction, env, ctx);
    case "mod_settings_change_avatar": return mod_settings_change_avatar_submitted(interaction, env, ctx);
    case "mod_settings_change_banner": return mod_settings_change_banner_submitted(interaction, env, ctx);
    case "mod_settings_toggle_notifications": return mod_settings_toggle_notifications_submitted(interaction, env, ctx);
    case "mod_settings_toggle_cheats": return mod_settings_toggle_cheats_submitted(interaction, env, ctx);
    case "mod_settings_change_colors": return mod_settings_change_colors_submitted(interaction, env, ctx);
    default: return new ClientError("Modal Not Found", `The modal \`${modName}\` is not available in this build.`).ShowUser();
  }
}

//-----------------------------------------------------------------------------
// Purpose: Handles submitted modals
//-----------------------------------------------------------------------------
function _handleMessageComponent(interaction, env, ctx) {
  const comName = interaction.data.custom_id.toLowerCase();

  // text adventure:
  const taCmdParts = comName.split(':');
  const taParent = taCmdParts.shift();
  switch (taParent) {
    case "madman": return new TA_MadMan(interaction, env, ctx).HandleAction(taCmdParts);
  }

  // new component system
  switch (comName) {
    // Selecton Menus
    case "sel_settings": return cmd_settings(interaction, env, ctx);
    // Buttons
    case "btn_settings_change_username": return mod_settings_change_username(interaction, env, ctx);
    case "btn_settings_change_email": return new ClientError("Coming Soon™", "You cannot currently change your XBLS account email. This feature is coming soon.").ShowUser();
    case "btn_settings_change_privacy": return mod_settings_change_privacy(interaction, env, ctx);
    case "btn_settings_remove_console": return mod_settings_remove_console(interaction, env, ctx);
    case "btn_settings_change_avatar": return mod_settings_change_avatar(interaction, env, ctx);
    case "btn_settings_change_banner": return mod_settings_change_banner(interaction, env, ctx);
    case "btn_settings_toggle_notifications": return mod_settings_toggle_notifications(interaction, env, ctx);
    case "btn_settings_toggle_cheats": return mod_settings_toggle_cheats(interaction, env, ctx);
    case "btn_settings_change_colors": return mod_settings_change_colors(interaction, env, ctx);
    default: return new ClientError("Component Not Found", `The component \`${comName}\` is not available in this build.`).ShowUser();
  }

  // normal shit:
  // switch (comName) {
  //   case "sel_settings": return cmd_settings(interaction, env, ctx);
  //   case "btn_change_name": return mod_set_username(interaction, env, ctx);
  //   case "btn_adventure_open_door": return stupidTextAdventureEndGame(interaction, env, ctx);
  //   case "btn_remove_console": return btn_remove_console(interaction, env, ctx);
  //   case "btn_settings": return cmd_settings(interaction, env, ctx);
  //   case "btn_profile": return cmd_profile(interaction, env, ctx);
  //   case "sel_change_privacy": return sel_change_privacy(interaction, env, ctx);
  //   default: return new ClientError("Component Not Found", `The component \`${comName}\` is not available in this build.`).ShowUser();
  // }
}
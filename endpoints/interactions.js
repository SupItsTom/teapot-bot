import { InteractionResponseType, InteractionType } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { ClientError, getDiscordUser } from "../utils/discord";
import { TeapotBot } from "../utils/teapot";
import { AutoComplete } from "../utils/autocomplete";
import { TA_MadMan } from "../textadventure/ta_madman";
import { global_blacklist } from "../metadata/blacklist.json";

import cmd_files from "../commands/cmd_files";
import cmd_quote from "../commands/cmd_quote";
import cmd_profile from "../commands/cmd_profile";
import cmd_status from "../commands/cmd_status";
import cmd_token from "../commands/cmd_token";
import cmd_settings from "../commands/cmd_settings";
import cmd_store from "../commands/cmd_store";
import mod_signin, { mod_signin_submitted } from "../modals/mod_signin";
import mod_gift from "../modals/mod_gift";
import mod_kv, { mod_kv_submitted } from "../modals/mod_kv";
import mod_set_username, { mod_set_username_submitted } from "../modals/mod_set_username";

import btn_remove_console from "../components/btn_remove_console";

import sel_change_privacy from "../components/sel_change_privacy";


//-----------------------------------------------------------------------------
// Purpose: Entry point to handle various command types
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
  const interaction = await request.json();

  console.info(`[endpoints:interactions] incoming request for ${InteractionType[interaction.type]}`);

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
  if (new TeapotBot(env).AreMonitorsOnline() === false)
    return new ClientError('Teapot Outage', 'Bot unavailable due to a temporary Teapot Live API outage.').ShowUser();

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

  //console.log(JSON.stringify(interaction));

  const modName = interaction.data.custom_id.toLowerCase();

  switch (modName) {
    case "mod_signin": return mod_signin_submitted(interaction, env, ctx);
    case "mod_set_username": return mod_set_username_submitted(interaction, env, ctx);
    //case "mod_kv": return mod_kv_submitted(interaction, env, ctx);

    default: return new ClientError("Modal Not Found", `The modal \`${modName}\` is not available in this build.`).ShowUser();
  }
}

//-----------------------------------------------------------------------------
// Purpose: Handles submitted modals
//-----------------------------------------------------------------------------
function _handleMessageComponent(interaction, env, ctx) {
  //console.log(`${JSON.stringify(interaction)}`)
  const comName = interaction.data.custom_id.toLowerCase();

  // madman text adventure handler
  const taCmdParts = comName.split(':');
  const taParent = taCmdParts.shift();

  switch (taParent) {
    case "madman": return new TA_MadMan(interaction, env, ctx).HandleAction(taCmdParts);
  }
  // ------------------------------

  switch (comName) {
    case "btn_gift_token": return mod_gift(interaction, env, ctx);
    case "btn_change_name": return mod_set_username(interaction, env, ctx);
    case "btn_adventure_open_door": return stupidTextAdventureEndGame(interaction, env, ctx);
    case "btn_remove_console": return btn_remove_console(interaction, env, ctx);
    case "btn_settings": return cmd_settings(interaction, env, ctx);
    case "btn_profile": return cmd_profile(interaction, env, ctx);

    case "sel_change_privacy": return sel_change_privacy(interaction, env, ctx);
    case "sel_update_cheats": return sel_settings_update(interaction, env, ctx);//TODO
    case "sel_update_notifications": return sel_settings_update(interaction, env, ctx);//TODO

    default: return new ClientError("Component Not Found", `The component \`${comName}\` is not available in this build.`).ShowUser();
  }
}
import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import mod_signin from "./mod_signin";
import { TA_MadMan } from "../textadventure/ta_madman";

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
      title: `Change Username`,
      custom_id: 'mod_set_username',
      components: [

        {
          type: 18,
          label: 'Username',
          description: 'Enter your new username.',
          component: {
            type: MessageComponentTypes.INPUT_TEXT,
            custom_id: 'mod_set_username:username',
            style: TextInputStyle.Short,
            min_length: 1,
            max_length: 32,
            placeholder: `${teapot.user.name}`,
            required: true
          }
        },
      ]
    }
  });
}

export async function mod_set_username_submitted(interaction, env, ctx) {

  const _username = interaction.data.components[0].component.value;

  
  if(_username.toLowerCase() === "madman"){
    console.log(`MadMan: attempting to 'start => new' game`)
    return new TA_MadMan(env).HandleAction(["start", "new"]);
  }

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  console.info(`[modals:mod_set_username] '${discord_user.id}' is attempting to update their username: ${_username}`);

  const _update_username = await postTeapotRequest(env, { action: "setdata", subaction: 'changename', newname: `${_username}`, email: `${bot_user.email}` });

  if(!_update_username.status) return new ClientError("Username Change Failed", "Unable to change username. Try again later maybe?").ShowUser();

  return cmd_profile(interaction, env, ctx);
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(env) {
  // This function can be used for any local logic if needed in the future.
}
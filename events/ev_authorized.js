import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent, sendDirectMessage } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # APPLICATION_AUTHORIZED Event
 * Webhook recieved when the app is added to a server or user account.
 * 
 * https://discord.com/developers/docs/events/webhook-events#application-authorized
 */
export default async function (interaction, env, ctx) {  
  const event_data = interaction.event.data;
  const event_user = interaction.event.data.user;

  console.log(`[events:authorized] event_user: '${event_user.id}'`)

  switch(event_data.scopes.includes){
    case "indetify": return OAUTH_IDENTIFY(interaction, env, ctx);
    case "role_connections.write": return OAUTH_ROLE_CONNECTIONS_WRITE(interaction, env, ctx);
    default: return new dropRequest(304)
  }
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function OAUTH_IDENTIFY(interaction, env, ctx){
  /* TODO - TRANSPARENCY REPORT:
   * Message event_user about actions the bot has taken on their behalf 
   * Eg: Checked their account email
  */

  return new dropRequest(304);
}

function OAUTH_ROLE_CONNECTIONS_WRITE(interaction, env, ctx){
  /* TODO - TRANSPARENCY REPORT:
  * Message event_user about actions the bot has taken on their behalf 
  * Eg: Updated role connection metadata for the application
  */

  return new dropRequest(304);
}
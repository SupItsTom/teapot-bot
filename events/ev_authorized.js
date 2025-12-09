import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent, sendDirectMessage } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # APPLICATION_AUTHORIZED Event
 * Ran when the application recieves the 'APPLICATION_AUTHORIZED' webhook.
 */
export default async function (interaction, env, ctx) {
  //    https://discord.com/developers/docs/events/webhook-events#application-authorized

  console.info(`[events:authorized] ${JSON.stringify(interaction)}`);

  
  const event_data = interaction.event.data;
  const event_user = interaction.event.data.user;


  console.log(`[events:authorized] event_user: '${event_user.id}'`)

  // this works fine but have no real use for it yet..
  
  // if(event_data.scopes.includes("role_connections.write")){
  //   await sendDirectMessage(event_user, `This message is a confirmation that your role metadata has been refreshed.`, env)
  // }

  return dropRequest(200)
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(){

}
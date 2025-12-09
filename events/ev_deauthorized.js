import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # APPLICATION_DEAUTHORIZED Event
 * Ran when the application recieves the 'APPLICATION_AUTHORIZED' webhook.
 */
export default async function (interaction, env, ctx) {
  //    https://discord.com/developers/docs/events/webhook-events#application-deauthorized

  console.info(`[events:deauthorized] ${JSON.stringify(interaction)}`);

  // delete user data from database when they unlink here.


  return dropRequest(200)
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(){

}
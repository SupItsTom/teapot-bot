import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";

/**
 * # ENTITLEMENT_CREATE Event
 * Ran when the application recieves the 'ENTITLEMENT_CREATE' webhook.
 */
//    https://discord.com/developers/docs/events/webhook-events#entitlement-create
export default async function (interaction, env, ctx) {

  const entitlement_data = interaction.event.data;
  console.info(`[events:entitlement_create] ${JSON.stringify(interaction)}`);
  
  // 1. user buys item from the store
  // 2. we get this event
  // 3. grant the item value to the teapot account
  // 4. invalidate the entitlement with a "claim" so it can't be used again

  // OR

  // 3. do nothing
  // 4. wait for user to claim it themselves from their gift inventory
  
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

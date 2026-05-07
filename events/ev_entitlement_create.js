import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # ENTITLEMENT_CREATE Event
 * Webhook recieved when an entitlement is created when a user purchases or is otherwise granted one of the app’s SKUs. 
 * 
 * https://docs.discord.com/developers/events/webhook-events#entitlement-create
 */
export default async function (interaction, env, ctx) {  
  const event_data = interaction.event.data;
  const event_user = interaction.event.data.user_id;

  console.log(`[events:authorized] event_user: '${event_user.id}'`)

  /* TODO - GRANT USER SKU PURCHASE:
  * Applies contents of the SKU to the users linked console
  * Eg: 
  */

  return new dropRequest(304);
}
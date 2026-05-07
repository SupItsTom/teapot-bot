import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # APPLICATION_DEAUTHORIZED Event
 * Webhook recieved when the app is deauthorized by a user.
 * 
 * https://discord.com/developers/docs/events/webhook-events#application-deauthorized
 */
export default async function (interaction, env, ctx) {  
  const event_data = interaction.event.data;
  const event_user = interaction.event.data.user;

  console.log(`[events:authorized] event_user: '${event_user.id}'`)

  /* TODO - AUTOMATICALLY CLEAR DATA FOR USER:
  * Clear data stored for event_user if any
  * Eg: Remove from database if connection records exist
  */

  return new dropRequest(304);
}
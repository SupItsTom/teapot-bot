import { InteractionResponseType, InteractionType, WebhookEventType, WebhookType } from "discord-interactions";
import { dropRequest, JsonResponse } from "../utils/client";
import { text } from "itty-router";
import ev_authorized from "../events/ev_authorized";
import ev_deauthorized from "../events/ev_deauthorized";
import ev_entitlement_create from "../events/ev_entitlement_create";

//-----------------------------------------------------------------------------
// Purpose: Entry point to handle various command types
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
  const interaction = await request.json();

  console.info(`[endpoints:webhooks] incoming request for ${WebhookType[interaction.type]}`);

  switch (interaction.type) {
    case WebhookType.PING: {
      return _handlePingRequest();
    }
    case WebhookType.EVENT: {
      return _handleEvent(interaction, env, ctx);
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
  // Docs say we should return 204 no content but only 200 works :/
  return text({ status: 200 });
}

//-----------------------------------------------------------------------------
// Purpose: Handle incoming event updates from Discord
//-----------------------------------------------------------------------------
function _handleEvent(interaction, env, ctx) {
  const eventType = interaction.event.type;

  switch (eventType) {
    case WebhookEventType.APPLICATION_AUTHORIZED: return ev_authorized(interaction, env, ctx);
    case "APPLICATION_DEAUTHORIZED": return ev_deauthorized(interaction, env, ctx);
    case WebhookEventType.ENTITLEMENT_CREATE: return ev_entitlement_create(interaction, env, ctx);
    default: return error(500, `Unhandled event type: ${eventType}`);
  }
}
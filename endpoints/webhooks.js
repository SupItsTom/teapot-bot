import { WebhookEventType, WebhookType } from 'discord-interactions';

import { dropRequest } from '../utils/client';

import ev_authorized from '../events/ev_authorized';
import ev_deauthorized from '../events/ev_deauthorized';
import ev_entitlement_create from '../events/ev_entitlement_create';

//-----------------------------------------------------------------------------
// Purpose: Entry point to handle various webhook types
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
	try {
		const interaction = await request.json();

		console.log(`[app]: Incoming webhook type: ${interaction.type}`);

		switch (interaction.type) {
			case WebhookType.PING:
				return _handlePingRequest();

			case WebhookType.EVENT:
				return await _handleEvent(interaction, env, ctx);

			default:
				console.log(`[app]: Unknown webhook type: ${interaction.type}`);

				return new dropRequest(400);
		}
	} catch (error) {
		console.error('[app]: Webhook handler error:', error);

		return new dropRequest(500);
	}
}

//-----------------------------------------------------------------------------
// Purpose: Let's Discord know we are alive
//-----------------------------------------------------------------------------
function _handlePingRequest() {
	return new dropRequest(204);
}

//-----------------------------------------------------------------------------
// Purpose: Handle incoming event updates from Discord
//-----------------------------------------------------------------------------
async function _handleEvent(interaction, env, ctx) {
	const eventType = interaction.event?.type;

	console.log(`[app]: Incoming event: ${eventType}`);

	switch (eventType) {
		case WebhookEventType.APPLICATION_AUTHORIZED:
			console.log('[app]: Handling APPLICATION_AUTHORIZED');

			return await ev_authorized(interaction, env, ctx);

		case 'APPLICATION_DEAUTHORIZED':
			console.log('[app]: Handling APPLICATION_DEAUTHORIZED');

			return await ev_deauthorized(interaction, env, ctx);

		case WebhookEventType.ENTITLEMENT_CREATE:
			console.log('[app]: Handling ENTITLEMENT_CREATE');

			return await ev_entitlement_create(interaction, env, ctx);

		default:
			console.log(`[app]: Unknown event type: ${eventType}`);

			return new dropRequest(400);
	}
}

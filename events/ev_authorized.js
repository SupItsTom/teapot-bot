import { dropRequest } from "../utils/client";

/**
 * # APPLICATION_AUTHORIZED Event
 * Webhook received when the app is added to a server or user account.
 *
 * https://discord.com/developers/docs/events/webhook-events#application-authorized
 */
export default async function (interaction, env, ctx) {
  const { scopes, user } = interaction.event.data;

  console.log(`[events:authorized] event_user: '${user.id}'`);
  console.log(`[events:authorized] scopes: ${scopes.join(", ")}`);

  const tasks = [];

  if (scopes.includes("identify")) {
    tasks.push(OAUTH_IDENTIFY(interaction, env, ctx));
  }

  if (scopes.includes("role_connections.write")) {
    tasks.push(OAUTH_ROLE_CONNECTIONS_WRITE(interaction, env, ctx));
  }

  await Promise.all(tasks);

  return new dropRequest(304);
}

/*****************************************************************************
**                         Local Functions
*****************************************************************************/

async function OAUTH_IDENTIFY(interaction, env, ctx) {
  /*
   * TODO - TRANSPARENCY REPORT:
   *
   * Message event user about actions the app has taken
   * on their behalf.
   *
   * Example:
   * - Checked their account email
   */

  const user = interaction.event.data.user;

  console.log(`[events:authorized:OAUTH_IDENTIFY] identify scope granted to '${user.id}'`);
}

async function OAUTH_ROLE_CONNECTIONS_WRITE(interaction, env, ctx) {
  /*
   * TODO - TRANSPARENCY REPORT:
   *
   * Message event user about actions the app has taken
   * on their behalf.
   *
   * Example:
   * - Updated role connection metadata for the application
   */

  const user = interaction.event.data.user;

  console.log(`[events:authorized:OAUTH_ROLE_CONNECTIONS_WRITE] role_connections.write scope granted to '${user.id}'`);
}
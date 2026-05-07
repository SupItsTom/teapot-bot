import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, getDiscordUser, MessageComponent } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";

/**
 * # Remove Console Button
 * Remove claims for console on active user
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return new ClientError("Unlink Failed", "You have no consoles linked to your account.");
  }

  console.log(`User '${discord_user.id} is requesting their active console to be unlinked`);

  await new TeapotBot(env).UnregisterUser(discord_user);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**REMOVE CONSOLE**`, -1),
            MessageComponent.Text(`Account Unlinked`, 2),
            MessageComponent.Text(`Your console has been unlinked successfully!`),
          ],
        },
      ]
    }
  });
}
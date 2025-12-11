import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # Quote Command
 * Retrieve a random quote from SkidPaste
 */
export default async function (interaction, env, ctx) {

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**What's New**`, 2),
            MessageComponent.Text(`<t:${Math.floor(new Date(env.CF_VERSION_METADATA.timestamp) / 1000)}:F>`, -1),
            MessageComponent.Seperator(),

            ...changelog,
          ],
        },
      ]
    }
  });
}
import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";

/**
 * # Quote Command
 * Retrieve a random quote from SkidPaste
 */
export default async function (interaction, env, ctx) {
  const quote = await postTeapotRequest(env, { action: "randquote" });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**QUOTE**`, -1),
            MessageComponent.Text(`${quote.name}`, 2),
            MessageComponent.Text(`Posted to **SkidPaste** <t:${quote.date}:R>${quote.name !== "Unnamed" ? ` by **${quote.name}**` : ""}.`, -1),
            MessageComponent.Seperator(),
            MessageComponent.Text(`${quote.quote}`, 0),
          ]
        }
      ]
    }
  });
}
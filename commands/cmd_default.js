import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";
import { ButtonStyle } from "discord-api-types/v10";

/**
 * # Default Command
 * Generic skeleton command
 */
export default async function (interaction, env, ctx) {

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**DEFAULT COMMAND**`, -1),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Default Title`, 3),
                MessageComponent.Text(`Default Description.`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "Default Button",
                style: ButtonStyle.Link,
                url: "https://supitstom.net",
              }
            },
          ]
        }
      ]
    }
  });
}
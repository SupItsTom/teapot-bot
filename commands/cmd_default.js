import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";
import { ButtonStyle } from "discord-api-types/v10";

/**
 * # Defer Testing Command
 * Test deferred responses and loading states
 */
export default async function (interaction, env, ctx) {

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**DEFERRED COMMAND**`, -1),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Demo Title`, 3),
                MessageComponent.Text(`Some useful information.`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "Call to action",
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

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction() {

}
import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { ButtonStyle } from "discord-api-types/v10";

/**
 * # Files Command
 * Retrieve static download links for Xbox Live Stealth
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

            MessageComponent.Text(`**SERVER FILES**`, -1),

            /*****************************************************************************
            **							  Standard Download								                          **
            *****************************************************************************/


            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Standard & Premium Edition`, 3),
                MessageComponent.Text(`The authentic XBLS experience.`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "Download",
                style: ButtonStyle.Link,
                url: "https://xboxstealth.net/files",
              }
            },

            /*****************************************************************************
            **							  Beta Download	      							                        **
            *****************************************************************************/

            // MessageComponent.Seperator(),

            // {
            //   type: MessageComponentTypes.SECTION,
            //   components: [
            //     MessageComponent.Text(`Beta Edition`, 3),
            //     MessageComponent.Text(`Early access to the original Xbox Live Stealth.`, -1),
            //   ],
            //   accessory: {
            //     type: MessageComponentTypes.BUTTON,
            //     label: "Download",
            //     style: ButtonStyle.Link,
            //     url: "https://xboxstealth.net/beta",
            //   }
            // },

            /*****************************************************************************
            **							  Core/Lite Download								                        **
            *****************************************************************************/

            MessageComponent.Seperator(),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Lite Edition`, 3),
                MessageComponent.Text(`Stripped down version of standard, and free.`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "Download",
                style: ButtonStyle.Link,
                url: "https://xboxstealth.net/lite",
              }
            },

            /*****************************************************************************
            **							  XDK Download    								                          **
            *****************************************************************************/

            MessageComponent.Seperator(),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`XDK Edition`, 3),
                MessageComponent.Text(`Standard, but for Dev Kits.`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "Download",
                style: ButtonStyle.Link,
                url: "https://xboxstealth.net/xdk",
              }
            },

            MessageComponent.Seperator(),

            MessageComponent.Text(`Want a complete feature list? [Click here](https://xboxstealth.net#features)`, -1),
          ],
        },
      ]
    }
  });
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(env) {
  // This function can be used for any local logic if needed in the future.
}
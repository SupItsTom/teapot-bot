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
        MessageComponent.Text(`**Acknowledgements**`, 1),
        MessageComponent.Seperator(),
        MessageComponent.Text(`**PACKAGES USED IN THIS PROJECT**`, -1),
        MessageComponent.Text(`${getPackageCredits()}`),

        MessageComponent.Text(`**THIS BOT ALSO USES THE FOLLOWING SERVICES**`, -1),
        MessageComponent.Text(`- **[DBox API](https://dbox.tools/)**`),
        MessageComponent.Seperator(),

        MessageComponent.Text(`Developed by **SupItsTom** on behalf of **Teapot Live**.`, -1),

        MessageComponent.Media(`https://media.tenor.com/LfHyw9vsNuAAAAAM/we-deserve-all-the-credit-eric-cartman.gif`),
      ]
    }
  });
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

import credits from "../metadata/strings/credits.json";

function getPackageCredits() {
  return credits.map(c => `- **[${c.name}](${c.url})**`).join("\n");
}
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

  let quote_type = 1;

  switch (quote_type) {
    case 0: return _getQuote(interaction, env, ctx);
    case 1: return _getLegacyQuote(interaction, env, ctx);
  }
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

async function _getLegacyQuote(interaction, env, ctx) {
  const quote = await postTeapotRequest(env, { action: "randquote" });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
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

async function _getQuote(interaction, env, ctx) {

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**QUOTE BY <@820362947146153994>**`, -1),
            MessageComponent.Seperator(),
            MessageComponent.Text(`>>> I'm all talk? Lets meet at a secluded place and I'll show you how much talk I am you pussy. I'll burry you so deep that your mommy will litter all of California with your missing posters.`, 0),

          ]
        }
      ]
    }
  });
}
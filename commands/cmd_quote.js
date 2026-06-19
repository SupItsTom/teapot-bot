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
  // decide which we wanna use:
  let quote_type = 0;

  switch(quote_type){
    case 0: return cmd_quote_skidpaste(interaction, env, ctx);
    case 1: return cmd_quote_discord(interaction, env, ctx);
  }
}

export async function cmd_quote_discord(interaction, env, ctx){

}

export async function cmd_quote_skidpaste(interaction, env, ctx){
  const skidpaste = await postTeapotRequest(env, { action: "randquote" });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**A WILD QUOTE APPEARS...**`, -1),
            MessageComponent.Text(`>>> ${skidpaste.quote}`, 3),
            MessageComponent.Text(`<:TeapotLive:1517619860971192530> ${skidpaste.name !== "Unnamed" ? `**${skidpaste.name}**` : "**SkidPaste User**"} • <t:${skidpaste.date}:R>`, 0),
          ]
        }
      ]
    }
  });
}
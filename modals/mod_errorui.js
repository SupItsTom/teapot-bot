import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl, Discord, AppWebhookEventType } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserAvatarType } from "../utils/teapot";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";
import { _profileComponent } from "../commands/cmd_profile";


/**
 * # Modal Submit
 */
export async function mod_errorui_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  // Modals require submit logic, though we don't really need to do anything here as errors are logged anyways. Give them false hope instead.

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags:
        InteractionResponseFlags.IS_COMPONENTS_V2 |
        InteractionResponseFlags.EPHEMERAL,

      components: [
        MessageComponent.Text(`Error report has been submitted!`, 0),
      ]
    }
  });
}
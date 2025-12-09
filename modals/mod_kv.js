import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";

/**
 * # KV Checker Modal
 * Modal to upload and check Keyvault files
 */
export default async function (interaction, env, ctx) {

  const discord_user = await getDiscordUser(interaction);

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Keyvault Kevin`,
      custom_id: 'mod_kv',
      components: [
        
        {
          type: 18,
          label: 'File Upload',
          description: 'Please upload the Keyvault you would like to check.',
          component: {
            type: 19,//ComponentType.FILE_UPLOAD
            custom_id: 'mod_kv:upload',
            required: true
          }
        },

        {
          type: 10,
          content: `### KV Only!\n-# Make sure you upload only the \`KV.bin\` file.`,
        },
      ]
    }
  });
}

export async function mod_kv_submitted(interaction, env, ctx){

  const _email = interaction.data.components[0].component.value;
  const _privacy = interaction.data.components[1].component.values[0];
  const discord_user = await getDiscordUser(interaction);

  return new ClientError("Feature Unavailable", "This feature is not available for you yet.").ShowUser();
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(env) {
  // This function can be used for any local logic if needed in the future.
}
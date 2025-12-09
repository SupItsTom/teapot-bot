import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { MessageComponent } from "../utils/discord";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";
import { postTeapotRequest } from "../utils/teapot";

/**
 * # Gift Modal
 * Modal to send tokens to another user
 */
export default async function (interaction, env, ctx) {

  //const stats = await postTeapotRequest(env, { action: "get_stats_filter" });

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Review your gift`,
      custom_id: 'mod_gift',
      components: [

        {
          type: 10,
          content: `## Gift\n-# Feeling generous? Give someone the gift of Teapot and make their day!`,
        },

        {
          type: 18,
          label: 'Select Friend',
          component: {
            type: MessageComponentTypes.USER_SELECT,
            custom_id: 'mod_gift:user_select',
            placeholder: 'Search friend',
            required: true,
          }

        },

        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.INPUT_TEXT,
              custom_id: 'mod_gift:token_input',
              label: 'Token',
              style: TextInputStyle.Short,
              min_length: 20,
              max_length: 20,
              placeholder: 'Enter 20-character token',
              required: true,
            },
          ]
        },

        {
          type: 10,
          content: `### NOTE\n-# Once you send this gift, the time on the token will be applied to the selected friend.`,
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
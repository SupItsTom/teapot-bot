import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";

/**
 * # Sign In Modal
 * Modal to link user accounts and set default settings
 */
export default async function (interaction, env, ctx) {

  const discord_user = await getDiscordUser(interaction);

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Login to Xbox Live Stealth`,
      custom_id: 'mod_signin',
      components: [
        
        {
          type: 18,
          label: 'Teapot Email',
          //description: 'Enter the email address linked to your console.',
          component: {
            type: MessageComponentTypes.INPUT_TEXT,
            custom_id: 'mod_signin:email',
            style: TextInputStyle.Short,
            min_length: 3,
            max_length: 254,
            placeholder: 'email@xboxstealth.net',
            required: true
          }
        },

        {
          type: 18,
          label: 'Profile Privacy',
          description: 'Would you like to allow others to view your profile?',
          component: {
            type: MessageComponentTypes.STRING_SELECT,
            custom_id: 'mod_signin:privacy',
            placeholder: 'Public',
            required: true,
            options: [
              {
                label: 'Public',
                value: 'public',
                description: 'Allow others to view your profile.',
                default: true,
              },
              {
                label: 'Private',
                value: 'private',
                description: 'Hide your profile from others.',
              }
            ]
          }
        },

        {
          type: 10,
          content: `### Need Help?\n-# To be able to lookup your console on the service, you will need to enter the email for it here. This is the email you entered when you signed up on the console, and you can find it again in the **Teapot Preferences** setting on the Xbox Guide menu.`,
        },
      ]
    }
  });
}

export async function mod_signin_submitted(interaction, env, ctx){

  const _email = interaction.data.components[0].component.value;
  const _privacy = interaction.data.components[1].component.values[0];
  const discord_user = await getDiscordUser(interaction);

  let _teapot_are_we_registered = await postTeapotRequest(env, { action: "link", email: _email })

  console.info(`[modals:mod_signin] '${discord_user.id}(${_email})' is attempting to create ${_privacy} profile, Teapot Account?: ${_teapot_are_we_registered.status}`);

  if(!_teapot_are_we_registered.status) return new ClientError(`Console not found`, `The email address you provided is not registered with Teapot. Check it and try again.`).ShowUser();

  // IF _privacy is 'private' then set is_private to true, else DEFAULT
  await new TeapotBot(env).RegisterUser(discord_user, _email, { is_private: _privacy === 'private' ? true : false });

  return cmd_profile(interaction, env, ctx);
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

function _localFunction(env) {
  // This function can be used for any local logic if needed in the future.
}
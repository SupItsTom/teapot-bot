import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import { Badges } from "../utils/badges";
import { Xbox } from "../utils/xbox";

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
          label: 'Public Profile',
          description: 'Allow others to see your profile in commands you run?',
          component: {
            type: 23,
            custom_id: 'mod_signin:privacy',
            default: true
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
  const _privacy = interaction.data.components[1].component.value;
  const discord_user = await getDiscordUser(interaction);

  let _teapot_are_we_registered = await postTeapotRequest(env, { action: "link", email: _email })

  console.info(`[modals:mod_signin] '${discord_user.id}(${_email})' is attempting to create [Public? ${_privacy}] profile, Teapot Account?: ${_teapot_are_we_registered.status}`);

  if(!_teapot_are_we_registered.status) return new ClientError(`Console not found`, `The email address you provided is not registered with Teapot. Check it and try again.`).ShowUser();

  await new TeapotBot(env).RegisterUser(discord_user, _email, { is_private: _privacy ? false : true });

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${_email}` });
  const bot_user = await new TeapotBot(env).GetUser(discord_user);
  let _profile_badges = await new Badges(env, discord_user).GetAll();
  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            
            MessageComponent.Text(`A Great Success!`, 3),
            MessageComponent.Text(`Your account has been successfully linked to Discord.`, -1),

            MessageComponent.Seperator(true, 2),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`<@${discord_user.id}> \`${teapot.user.name}\``, 2),
                MessageComponent.Text(`${teapot.user.online == true ? `**${teapot.user.title.name === "None Set" ? "Currently Online" : `Playing ${_game_info.name}`}**` : `**Last Seen <t:${teapot.user.date_lastseen_unix}:R>${teapot.user.title.name === "None Set" ? "" : ` on ${_game_info.name}`}**`}`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "My Profile",
                style: ButtonStyle.Primary,
                custom_id: "btn_profile",
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

function _localFunction(env) {
  // This function can be used for any local logic if needed in the future.
}
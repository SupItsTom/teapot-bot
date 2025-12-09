import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, getDiscordUser, MessageComponent } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";

/**
 * # Quote Command
 * Retrieve a random quote from SkidPaste
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return new ClientError("Privacy Change Failed", "You have no consoles linked to your account.");
  }

  let is_private = interaction.data.values[0] === 'private' ? true : false;

  console.log(`User '${discord_user.id} is requesting profile privacy to be is_private=${is_private}`);

  await new TeapotBot(env).UpdatePrivacy(discord_user, is_private);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**PROFILE PRIVACY**`, -1),

            MessageComponent.Text(`${interaction.data.values[0] === 'private' ? "Private Profile" : "Public Profile"}`, 2),
            MessageComponent.Text(`${interaction.data.values[0] === 'private' ? "Your profile and activity is now only visible to you!" : "Your profile is now visible to everyone on Discord!"}`),
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

}
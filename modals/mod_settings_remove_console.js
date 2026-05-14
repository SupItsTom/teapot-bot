import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, getDisplayName, MessageComponent, ClientError } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import cmd_profile from "../commands/cmd_profile";
import mod_signin from "./mod_signin";
import { TA_MadMan } from "../textadventure/ta_madman";
import { _renderSettings } from "../commands/cmd_settings";

/**
 * # Change Username Modal
 * Modal to change a users username
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      "title": `Unlink Console`,
      "custom_id": 'mod_settings_remove_console',
      "components": [
        {
          "type": ComponentType.TextDisplay,
          "content": "## Notice\nYour console will be removed from Teapot Bot. You will not be able to use commands that interact with your console. You may re-link at any time!"
        },
        {
          "type": ComponentType.Label,
          "label": "Are you sure?",
          "component": {
            "type": ComponentType.CheckboxGroup,
            "custom_id": "mod_settings_remove_console:i_agree",
            "required": true,
            "options": [
              { "value": "i_agree", "label": "I understand" },
            ]
          }
        }
      ]
    }
  });
}

export async function mod_settings_remove_console_submitted(interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  await new TeapotBot(env).UnregisterUser(discord_user);

  // fetch new data, not needed if it doesn't update the server account
  //const teapot_refresh = await postTeapotRequest(env, { action: "overview", email: bot_user.email });

  // refreshes the settings component like a madman
  return new JsonResponse({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**CONSOLE REMOVED**`, -1),

            MessageComponent.Text("Console Unlinked", 2),
            MessageComponent.Text("Your console has been successfully unlinked. You may re-link at any time!"),
            MessageComponent.Seperator(),
            MessageComponent.Text("If you would like to link a different console, please contact [SupItsTom](mailto:teapot@supitstom.net).", -1),
          ],
        },
      ]
    }
  });
}
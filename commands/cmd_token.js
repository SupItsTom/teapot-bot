import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { ATXHeader, JsonResponse } from "../utils/client";
import { MessageComponent, ClientError, getDiscordUser } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import { ButtonStyle } from "discord-api-types/v10";
import mod_signin from "../modals/mod_signin";
import mod_gift from "../modals/mod_gift";

/**
 * # Token
 * Check or redeem a token on a user profile
 */
export default async function (interaction, env, ctx) {

  let subCmdName = interaction.data.options[0].name;
  let tokenInput = interaction.data.options[0].options[0].value;

  

  switch (subCmdName) {
    case "check": return _checkToken({env, interaction, ctx}, tokenInput);
    case "redeem": return _applyToken({env, interaction, ctx}, tokenInput);
    case "gift": return mod_gift(interaction, env, ctx);
    default: return new ClientError("Command Not Found", `The sub-command \`${subCmdName}\` is not available in this build.`).ShowUser();
  }
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

async function _checkToken(request, tokenInput) {
  const _tokenData = await postTeapotRequest(request.env, { action: "checktoken", token: `${tokenInput}` });

  const discord_user = await getDiscordUser(request.interaction);
  const bot_user = await new TeapotBot(request.env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(request.interaction, request.env, request.ctx);
  }

  if (!_tokenData.token.valid || _tokenData.token.redeemed) return new ClientError("Token Invalid", "Sorry, looks like this code isn't valid.").ShowUser();
  // if (_tokenData.token.redeemed) return new ClientError("Token Redeemed", "Sorry, looks like this code has already been redeemed.").ShowUser();

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**CHECK A TOKEN**`, ATXHeader.Tiny),

            MessageComponent.Text(`${_tokenData.token.length === "lifetime" ? "Unlimited Access (Lifetime)" : `${_tokenData.token.length} day(s)`}`, ATXHeader.Small),
            MessageComponent.Text(`Once you redeem, you will have access for **${_tokenData.token.length === "lifetime" ? "Lifetime" : `${_tokenData.token.length} day(s)`}**. `, ATXHeader.Tiny),

            MessageComponent.Seperator(),

            MessageComponent.Text(`This will be applied to **${bot_user.email}** if you choose to redeem it.`, -1),
          ]
        }
      ]
    }
  });
}

async function _applyToken(request, tokenInput) {
  const discord_user = await getDiscordUser(request.interaction);
  const bot_user = await new TeapotBot(request.env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(request.interaction, request.env, request.ctx);
  }

  const _tokenData = await postTeapotRequest(request.env, { action: "redeem", email: `${bot_user.email}`, token: `${tokenInput}` });
  
  if (_tokenData.token.status != 1) return new ClientError("Token Invalid", "Sorry, looks like this code isn't valid.").ShowUser();

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**REDEEM A TOKEN**`, ATXHeader.Tiny),

            MessageComponent.Text(`Awesome!`, ATXHeader.Small),
            MessageComponent.Text(`**${_tokenData.token.lifetime ? "Unlimited Access (Lifetime)" : `${_tokenData.token.length} day(s)`}** has been applied to **${bot_user.email}**.`, ATXHeader.Tiny),

          ]
        }
      ]
    }
  });
}

async function _giftToken(request, tokenInput) {
  // todo
}
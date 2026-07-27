import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl, Discord, AppWebhookEventType } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserAvatarType } from "../utils/teapot";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";
import { _profileComponent } from "../commands/cmd_profile";

/**
 * # Create Lobby Modal
 * Modal to spawn a lobby server event
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  if (!teapot.user.online ||
      teapot.user.title.name === "None Set"
  ) return new ClientError({
      title: "Cannot Create Lobby",
      message: `You must be online and playing a game to start a lobby.`,
    }).ShowModal();

  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Create Lobby`,
      custom_id: "mod_lobby_create",
      components: [
        {
          type: ComponentType.TextDisplay,
          content:
            "## You're about to create a lobby...\nLets double check everything is right!"
        },
        {
          type: ComponentType.TextDisplay,
          content:
            `Host Gamertag: **${teapot.user.gamertag}**\nWants to play: **${_game_info.name}**`
        },
        {
          type: ComponentType.TextDisplay,
          content:
            `-# Looks good? Click **Submit** to create your lobby!\n-# If not, please allow upto 4 minutes for your information to be updated.`
        }
      ]
    }
  });
}

/**
 * # Modal Submit
 */
export async function mod_lobby_create_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  if (!teapot.user.online ||
      teapot.user.title.name === "None Set"
  ) return new ClientError({
      title: "Cannot Create Lobby",
      message: `You must be online and playing a game to start a lobby.`,
    }).ShowModal();
  
  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);

  // CREATE LOBBY EVENT FOR ACTIVE SERVER HERE

  await new Discord(env).RemoveExistingLobbyEvent(
    interaction.guild_id,
    teapot.user.gamertag
  );

  const lobby_event = await new Discord(env).CreateGuildScheduledEvent({
    guildId: interaction.guild_id,
    name: `${_game_info.name}`,
    // description: null,
    startTime: new Date(Date.now() + 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    entityType: 3,
    location: `Host Gamertag:⠀**${teapot.user.gamertag}**`
  });

  console.info(
    `[lobby_create] Created Discord event ${lobby_event.id}`
  );

  // this feature dis-reguards profile privacy as data contains info supposed to be seen by others
  await new Discord(env).SendWebhookEvent(AppWebhookEventType.USER_LOBBY_CREATE,
    `-# **[${discord_user.username}](discord://-/users/${discord_user.id})** wants to play **[${_game_info.name}](<https://discord.com/events/${interaction.guild_id}/${lobby_event.id}>)**. <@&1528168717458997338>`
  );


  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags:
        InteractionResponseFlags.IS_COMPONENTS_V2 |
        InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Lobby Created!`, 2),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "View Details",
                style: ButtonStyle.Link,
                url: `https://discord.com/events/${interaction.guild_id}/${lobby_event.id}`,
              }
            },
          ]
        }
      ]
    }
  });
}
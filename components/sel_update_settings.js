import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, getDiscordUser, MessageComponent } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";

/**
 * # Update Notifications Select Menu
 * Update Notification settings from selection menu
 */
export async function sel_update_notifications(interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return new ClientError("Notification Update Failed", "You have no consoles linked to your account.");
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  let _xnotify_welcome = interaction.data.values.includes("welcome")
  let _xnotify_xamchal = interaction.data.values.includes("xamchal")
  let _xnotify_xoschal = interaction.data. values.includes("xoschal")

  const _current_engines = Object.values(teapot.user.options.engines)
  .reduce((acc, [name, enabled]) => {
    acc[name] = enabled ? 1 : 0;
    return acc;
  }, {});

  const teapot_data = await postTeapotRequest(env, {
    action: "setdata",
    subaction: "setoptions",
    email: bot_user.email,

    N_WELCOME: _xnotify_welcome ? 1 : 0,
    N_XAM: _xnotify_xamchal ? 1 : 0,
    N_XOSC: _xnotify_xoschal ? 1 : 0,

    ..._current_engines
  });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**NOTIFICATION SETTINGS**`, -1),
            MessageComponent.Text(`Your notification settings have been updated!`),
          ],
        },
      ]
    }
  });
}

/**
 * # Update Cheat Engine Select Menu
 * Update Cheat Engine settings from selection menu
 */
export async function sel_update_engines(interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return new ClientError("Engine Update Failed", "You have no consoles linked to your account.");
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  const _engine_mw2 = interaction.data.values.includes("41560817");
  const _engine_bo2 = interaction.data.values.includes("415608C3");
  const _engine_mw3 = interaction.data.values.includes("415608CB");
  const _engine_bo1 = interaction.data.values.includes("41560855");
  const _engine_ghosts = interaction.data.values.includes("415608FC");
  const _engine_aw = interaction.data.values.includes("41560914");
  const _engine_bo3 = interaction.data.values.includes("4156091D");
  const _engine_waw = interaction.data.values.includes("4156081C");
  const _engine_cod4 = interaction.data.values.includes("415607E6");

  const teapot_data = await postTeapotRequest(env, {
    action: "setdata",
    subaction: "setoptions",
    email: bot_user.email,

    N_WELCOME: teapot.user.options.xnotify.welcome ? 1 : 0,
    N_XAM: teapot.user.options.xnotify.xamchal ? 1 : 0,
    N_XOSC: teapot.user.options.xnotify.xoschal ? 1 : 0,

    MW2: _engine_mw2 ? 1 : 0,
    BO2: _engine_bo2 ? 1 : 0,
    MW3: _engine_mw3 ? 1 : 0,
    BO1: _engine_bo1 ? 1 : 0,
    GHOSTS: _engine_ghosts ? 1 : 0,
    AW: _engine_aw ? 1 : 0,
    BO3: _engine_bo3 ? 1 : 0,
    WAW: _engine_waw ? 1 : 0,
    COD4: _engine_cod4 ? 1 : 0,
  });

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`**ENGINE SETTINGS**`, -1),
            MessageComponent.Text(`Your engine settings have been updated!`),
          ],
        },
      ]
    }
  });
}
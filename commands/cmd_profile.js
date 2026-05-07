import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas, truncateRelativeTime } from "../utils/client";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import mod_signin from "../modals/mod_signin";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";
import { Flairs } from "../utils/flairs";

/**
 * # Profile Command
 * Fetch and display the user's profile information
 */
export default async function (interaction, env, ctx) {

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });
  const teapot_kv = await postTeapotRequest(env, { action: "kvstatus", email: `${bot_user.email}` });

  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);
  let _profile_badges = await new Badges(env, discord_user).GetAll();

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | (bot_user.is_private ? InteractionResponseFlags.EPHEMERAL : null),

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**PROFILE**`, -1),

            ...(
              _game_info &&
                _game_info.bing_id &&
                teapot.user.title.id !== "0xFFFE07D1"
                ? [
                  MessageComponent.Media(
                    `http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`,
                    { description: `Game banner for '${_game_info.name}'` }
                  )
                ]
                : []
            ),

            {
              type: ComponentType.Section,
              components: [
                MessageComponent.Text(`<@${discord_user.id}> \`${teapot.user.name}\``, 2),
                MessageComponent.Text(`${teapot.user.online == true ? `**${teapot.user.title.name === "None Set" ? "Currently Online" : `Playing [${_game_info.name}](https://dbox.tools/marketplace/products/${_game_info.bing_id})`}**` : `**Last Seen <t:${teapot.user.date_lastseen_unix}:R>${teapot.user.title.name === "None Set" ? "" : ` on [${_game_info.name}](https://dbox.tools/marketplace/products/${_game_info.bing_id})`}**`}`, -1),
                ...(_profile_badges ? [MessageComponent.Text(`${_profile_badges}`, 1)] : []),
              ],
              accessory: {
                type: ComponentType.Thumbnail,
                media: {
                  url: `http://avatar.xboxlive.com/avatar/${encodeURIComponent(teapot.user.gamertag.trim())}/avatarpic-l.png`
                }
              }
            },

            MessageComponent.Seperator(),

            MessageComponent.Text(`
-# **XBOX LIVE STEALTH**
**Gamertag:** ${teapot.user.gamertag == "" ? "Not Signed In" : `${teapot.user.gamertag}`}
**Challenges:** ${numberWithCommas(teapot.user.xke_count)}
**Time Remaining:** ${teapot.user.timeleft.lifetime == true ? `Lifetime${teapot.user.timeleft.premium == true ? " (Premium)" : ""}` : `${teapot.user.timeleft.banked.days}d ${teapot.user.timeleft.banked.timeleft}`}
**Keyvault Time:** ${teapot_kv.time == "" ? "Not set" : `${truncateRelativeTime(teapot_kv.time)}`}
`),

            MessageComponent.Seperator(),

            {
              type: ComponentType.Section,
              components: [
                MessageComponent.Text(`
-# **MEMBER SINCE**
-# <:Teapot:1502039411582566440> <t:${teapot.user.date_registered_unix}:D> **•** <:Discord:1502039384944414790> <t:${Math.floor(new Date(bot_user.timestamp) / 1000)}:D>
`),
              ],
              accessory: getTenureButtonLabel(teapot.user.date_registered_unix, bot_user),
            },
          ]
        },
      ]
    }
  });
}

function getTenureButtonLabel(teapot_date_registered, bot_user) {
  const years = Math.floor(
    (Date.now() / 1000 - teapot_date_registered) / (60 * 60 * 24 * 365.25)
  );

  if (years <= 0) return null;

  return {
    type: MessageComponentTypes.BUTTON,
    // todo: incremement emoji tenure badge
    label: `${years} Year${years !== 1 ? "s" : ""} of Service`,
    style: ButtonStyle.Secondary,
    custom_id: `btn_readonly-${bot_user.id}-tenure`,
    disabled: true,
  };
}
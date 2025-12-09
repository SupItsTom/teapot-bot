import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse, numberWithCommas } from "../utils/client";
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


  // TEST
  //let _mock_titleid = "FFED3001"; // Spoof title id information
  //let _game_info = await new Xbox().GetGameFromTitleID(_mock_titleid);
  // END TEST

  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);
  //let _product_info = await new Xbox().GetMarketplaceProduct(_game_info.bing_id !== null ? _game_info.bing_id : "66acd000-77fe-1000-9115-d802fffe07d1"); //TODO: this throws errors when title id 'Not Found' is returned by _game_info
  let _profile_badges = await new Badges(env, discord_user).GetAll()



  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | (bot_user.is_private ? InteractionResponseFlags.EPHEMERAL : null),

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          //accent_color: Number(`0x${teapot.user.colors.dashbg.substring(2)}`),
          components: [

            MessageComponent.Text(`**PROFILE** ${new Flairs(env).GetFlair("BETA")}`, -1),

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
                MessageComponent.Text(`${teapot.user.online == true ? `**${teapot.user.title.name === "None Set" ? "Currently Online" : `Playing ${_game_info.name}`}**` : `**Last Seen <t:${teapot.user.date_lastseen_unix}:R>${teapot.user.title.name === "None Set" ? "" : ` on ${_game_info.name}`}**`}`, -1),
                ...(_profile_badges ? [MessageComponent.Text(`${_profile_badges}`, 1)] : []),
              ],
              accessory: {
                type: ComponentType.Thumbnail,
                media: {
                  url: `${getAvatarUrl(discord_user)}`
                }
              }
            },

            MessageComponent.Seperator(),

            {
              type: ComponentType.Section,
              components: [
                MessageComponent.Text(`
Gamertag: **${teapot.user.gamertag == null ? "Not Signed In" : `${teapot.user.gamertag}`}**
CPU Key: **${bot_user.is_private ? `\`${teapot.user.cpukey}\`` : `\`••••${teapot.user.cpukey.slice(-4)}\``}**
Challenges: **${numberWithCommas(teapot.user.xke_count)}**
Registered: **<t:${teapot.user.date_registered_unix}:d>**
Linked: **<t:${Math.floor(new Date(bot_user.timestamp) / 1000)}:d>**
`),
              ],
              accessory: {
                type: ComponentType.Thumbnail,
                media: {
                  url: `http://avatar.xboxlive.com/avatar/${encodeURIComponent(teapot.user.gamertag.trim())}/avatarpic-l.png`
                }
              }
            },

            MessageComponent.Seperator(),



//             ...(
//               _game_info &&
//               _game_info.bing_id &&
//               teapot.user.title.id !== "0xFFFE07D1"
//                 ? [
//                     {
//                       type: ComponentType.Section,
//                       components: [
//                         MessageComponent.Text(`
// Game Name: **${_game_info.name}**
// Release Date: **<t:${new Date(_product_info.global_original_release_date).getTime() / 1000}:d>**
// Title ID: **${_product_info.title_id}**
// Developer: **${_product_info.developer_name}**
// Publisher: **${_product_info.publisher_name}**
// `),
//                       ],
//                       accessory: {
//                         type: ComponentType.Thumbnail,
//                         media: {
//                           url: `http://download.xbox.com/content/images/${_game_info.bing_id}/tile.png`
//                         }
//                       }
//                     },
//                     MessageComponent.Seperator(),
//                 ]
//                 : []
//             ),

            MessageComponent.Text(`
Time Left: ${teapot.user.timeleft.lifetime == true ? `**Lifetime${teapot.user.timeleft.premium == true ? " (Premium)**" : `**`}` : `**${teapot.user.timeleft.current_day}d ${teapot.user.timeleft.timeleft}**\n- Reserved: **${teapot.user.timeleft.banked.days}d**`}
${teapot_kv.time == "" ? "" : `KV Life: **\`${teapot_kv.time}`}\`**
`),

//             {
//               type: ComponentType.Section,
//               components: [
//                 MessageComponent.Text(`
// Time Left: ${teapot.user.timeleft.lifetime == true ? `**Lifetime${teapot.user.timeleft.premium == true ? " (Premium)**" : `**`}` : `**${teapot.user.timeleft.current_day}d ${teapot.user.timeleft.timeleft}**\n- Reserved: **${teapot.user.timeleft.banked.days}d**`}
// ${teapot_kv.time == "" ? "" : `KV Life: **\`${teapot_kv.time}`}\`**
// `),
//               ],
//               accessory: {
//                 type: MessageComponentTypes.BUTTON,
//                 style: ButtonStyle.Success,
//                 label: 'Gift a Token',
//                 custom_id: 'btn_gift',
//               },
//             },

          ]
        },

        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyle.Secondary,
              label: 'Settings',
              custom_id: 'btn_settings',
            },
          ]
        },


      ]
    }
  });
}

/*****************************************************************************
**          							   Exported Functions				                      **
*****************************************************************************/

export function cmd_profile_chooser(interaction, env, ctx) {
  return new ClientError("Feature Unavailable", "This feature is not yet implemented.").ShowUser();
}

/*****************************************************************************
**          							   Local Functions				                        **
*****************************************************************************/

async function _profile_v2(interaction, env, ctx) {

}

async function _meme_me_up_scotty(interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_signin(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });
  const teapot_kv = await postTeapotRequest(env, { action: "kvstatus", email: `${bot_user.email}` });


  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);
  //let _product_info = await new Xbox().GetMarketplaceProduct(_game_info.bing_id); //TODO: this throws errors when title id 'Not Found' is returned by _game_info
  let _profile_badges = await new Badges(env, discord_user).GetAll()



  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | (bot_user.is_private ? InteractionResponseFlags.EPHEMERAL : null),

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**PROFILE 2.0 DIGITAL DELUXE EDITION**`, -1),

            MessageComponent.Media('https://web-assets.cdn.supitstom.net/hypercam2.png'),

            ...(_game_info ? [MessageComponent.Media(`http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`, { description: `Game banner for '${_game_info.name}'` })] : []),

            {
              type: ComponentType.Section,
              components: [
                MessageComponent.Text(`<@${discord_user.id}> \`${teapot.user.name}\``, 2),
                MessageComponent.Text(`${teapot.user.online == true ? `**${teapot.user.title.name === "None Set" ? "Currently Online" : `Playing ${teapot.user.title.name}`}**` : `**Last Seen <t:${teapot.user.date_lastseen_unix}:R>${teapot.user.title.name === "None Set" ? "" : ` on ${teapot.user.title.name}`}**`}`, -1),
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
**Gamertag:** \`${teapot.user.gamertag == null ? "Not Signed In" : `${teapot.user.gamertag}`}\`
**CPU Key:** ${bot_user.is_private ? `\`${teapot.user.cpukey}\`` : `\`••••${teapot.user.cpukey.slice(-4)}\``}
**Challenges:** \`${teapot.user.xke_count}\`
**Registered:** <t:${teapot.user.date_registered_unix}:d>

`),

            MessageComponent.Seperator(),

            MessageComponent.Text(`
**Time Left:** \`${teapot.user.timeleft.lifetime == true ? `Lifetime` : `${teapot.user.timeleft.current_day}d ${teapot.user.timeleft.timeleft}\`\n- **Reserved:** \`${teapot.user.timeleft.banked.days}d`}\`
**KV Life:** \`${teapot_kv.time == "" ? "Inactive" : `${teapot_kv.time}`}\`
`),

            MessageComponent.Media('https://web-assets.cdn.supitstom.net/rtx-on.png')

          ]
        },

        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyle.Secondary,
              label: 'Settings',
              custom_id: 'btn_settings',
            },
          ]
        },

        // MessageComponent.Text(`\`[⭐DEBUG] bot_user:\`\n\`\`\`json\n${JSON.stringify(bot_user, null, 2)}\`\`\``, 3),
        // MessageComponent.Text(`\`[⭐DEBUG] teapot:\`\n\`\`\`json\n${JSON.stringify(teapot, null, 2)}\`\`\``, 3),
        // MessageComponent.Text(`\`[⭐DEBUG] teapot_kv:\`\n\`\`\`json\n${JSON.stringify(teapot_kv, null, 2)}\`\`\``, 3),
      ]
    }
  });
}

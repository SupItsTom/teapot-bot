import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { ATXHeader, JsonResponse } from "../utils/client";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl } from "../utils/discord";
import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import mod_signin from "../modals/mod_signin";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";

/**
 * # Settings Command
 * Update bot & server settings
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
  let _profile_badges = await new Badges(env, discord_user).GetAll()

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: [
        
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**SETTINGS**`, -1),

            ...(_game_info ? [MessageComponent.Media(`http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`, { description: `Game banner for '${_game_info.name}'` })] : []),

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

            MessageComponent.Text(`**CONNECTION DETAILS**`, -1),
            {
              type: MessageComponentTypes.SECTION,
              components: [
                //MessageComponent.Text(`${bot_user.is_private ? `\`${teapot.user.cpukey}\`` : `\`••••${teapot.user.cpukey.slice(-4)}\``}`, 3),
                MessageComponent.Text(`\`${teapot.user.cpukey}\``, 3),
                MessageComponent.Text(`Connected: <t:${Math.floor(new Date(bot_user.timestamp) / 1000)}:F>`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                style: ButtonStyle.Danger,
                label: `Remove Console`,
                custom_id: 'btn_remove_console',
              }
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  custom_id: 'sel_change_privacy',
                  // placeholder: `${bot_user.is_private ? `Public` : `Private`}`,
                  required: false,
                  options: [
                    {
                      label: 'Others can see your profile',
                      value: 'public',
                      description: 'Allow others to view your profile.',
                      default: bot_user.is_private ? false : true,
                    },
                    {
                      label: 'Nobody can see your profile',
                      value: 'private',
                      description: 'Hide your profile from others.',
                      default: bot_user.is_private ? true : false,
                    }
                  ]
                }
              ]
            },

            MessageComponent.Seperator(),
            
            ...(teapot.user.plugins ? [
              MessageComponent.Text(`**PLUGIN LIST**`, -1), MessageComponent.Text(`${teapot.user.plugins.Plugin1 ? `1. ${teapot.user.plugins.Plugin1}\n` : ""}${teapot.user.plugins.Plugin2 ? `2. ${teapot.user.plugins.Plugin2}\n` : ""}${teapot.user.plugins.Plugin3 ? `3. ${teapot.user.plugins.Plugin3}\n` : ""}${teapot.user.plugins.Plugin4 ? `4. ${teapot.user.plugins.Plugin4}\n` : ""}${teapot.user.plugins.Plugin5 ? `5. ${teapot.user.plugins.Plugin5}` : ""}`, ATXHeader.None)
            ] : []),

            MessageComponent.Seperator(),

            MessageComponent.Text(`**NOTIFICATION SETTINGS**`, -1),
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  custom_id: 'sel_update_notifications',
                  placeholder: 'No Notifications Enabled',
                  min_values: 0,
                  max_values: 3,
                  required: true,
                  disabled: false,
    
                  options: [
                    {
                      label: 'Welcome Message',
                      value: 'welcome',
                      description: 'Toggle Server Logon Notifications',
                      default: teapot.user.options.xnotify.welcome
                    },
                    {
                      label: 'XAM',
                      value: 'xamchal',
                      description: 'Toggle XAM Challenge Success',
                      default: teapot.user.options.xnotify.xamchal
                    },
                    {
                      label: 'XOS',
                      value: 'xoschal',
                      description: 'Toggle XOS Challenge Success',
                      default: teapot.user.options.xnotify.xoschal
                    },
                  ]
                }
              ]
            },

            MessageComponent.Text(`**CHEAT ENGINE SETTINGS**`, -1),
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  custom_id: 'sel_update_cheats',
                  placeholder: 'No Cheats Enabled',
                  min_values: 0,
                  max_values: 9,
                  required: true,
                  disabled: false,
    
                  options: [
                    {
                      label: 'MW2',
                      value: '41560817',
                      description: 'Toggle MW2 Cheats',
                      default: teapot.user.options.engines["41560817"][1]
                    },
                    {
                      label: 'BO1',
                      value: '41560855',
                      description: 'Toggle BO1 Cheats',
                      default: teapot.user.options.engines["41560855"][1]
                    },
                    {
                      label: 'AW',
                      value: '41560914',
                      description: 'Toggle AW Cheats',
                      default: teapot.user.options.engines["41560914"][1]
                    },
                    {
                      label: 'BO2',
                      value: '415608C3',
                      description: 'Toggle BO2 Cheats',
                      default: teapot.user.options.engines["415608C3"][1]
                    },
                    {
                      label: 'MW3',
                      value: '415608CB',
                      description: 'Toggle MW3 Cheats',
                      default: teapot.user.options.engines["415608CB"][1]
                    },
                    {
                      label: 'Ghosts',
                      value: '415608FC',
                      description: 'Toggle Ghosts Cheats',
                      default: teapot.user.options.engines["415608FC"][1]
                    },
                    {
                      label: 'BO3',
                      value: '4156091D',
                      description: 'Toggle BO3 Cheats',
                      default: teapot.user.options.engines["4156091D"][1]
                    },
                    {
                      label: 'WAW',
                      value: '4156081C',
                      description: 'Toggle WAW Cheats',
                      default: teapot.user.options.engines["4156081C"][1]
                    },
                    {
                      label: 'COD4',
                      value: '415607E6',
                      description: 'Toggle COD4 Cheats',
                      default: teapot.user.options.engines["415607E6"][1]
                    },
                  ]
                }
              ]
            },

            MessageComponent.Seperator(),

            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyle.Secondary,
                  label: 'Change Username',
                  custom_id: 'btn_change_name',
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyle.Link,
                  label: 'Refresh Role Metadata',
                  url: `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION.CLIENT_ID}&response_type=code&redirect_uri=${encodeURI(env.DISCORD_APPLICATION.REDIRECT_URI)}&scope=role_connections.write+identify`,
                },
              ]
            },
            // {
            //   type: MessageComponentTypes.ACTION_ROW,
            //   components: [
            //     {
            //       type: MessageComponentTypes.BUTTON,
            //       style: ButtonStyle.Link,
            //       label: 'Refresh Role Metadata',
            //       url: `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION.CLIENT_ID}&response_type=code&redirect_uri=${encodeURI(env.DISCORD_APPLICATION.REDIRECT_URI)}&scope=role_connections.write+identify`,
            //     },
            //   ]
            // },
          ]

        },



      ]
    }
  });
}
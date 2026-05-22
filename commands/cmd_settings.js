import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { JsonResponse } from "../utils/client";
import { getDiscordUser, MessageComponent } from "../utils/discord";
import { avatarTypeLabel, bannerTypeLabel, postTeapotRequest, TeapotBot, UserAvatarType, UserBannerType } from "../utils/teapot";
import { GetColorText } from "../utils/colors";

import mod_onboarding_logon, { mod_onboarding_logon_submitted } from "../modals/mod_onboarding_logon";

export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);

  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: `${bot_user.email}` });

  // which page? default is general
  let selected = "sel_settings_general";

  // Select menu interaction
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    selected = interaction.data.values[0];
  }

  // response type
  const responseType = interaction.type === 3 ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE;

  return new JsonResponse({
    type: responseType,
    data: {
      allowed_mentions: { parse: [] },
      flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

      components: await _renderSettings(teapot, bot_user, selected)
    }
  });
}

export async function _renderSettings(teapot, bot_user, selected) {
  let settingsPage = [];

  switch (selected) {
    case "sel_settings_general":
      settingsPage = await _cmd_settings_general(teapot, bot_user);
      break;
    case "sel_settings_preference":
      settingsPage = await _cmd_settings_preference(teapot, bot_user);
      break;
  }

  return [
    {
      type: MessageComponentTypes.CONTAINER,
      components: [
        MessageComponent.Text(`**SETTINGS**`, -1),

        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "sel_settings",
              placeholder: "User Settings",
              min_values: 1,
              max_values: 1,
              options: [
                {
                  label: "General Settings",
                  value: "sel_settings_general",
                  default: selected === "sel_settings_general"
                },
                {
                  label: "Preference Settings",
                  value: "sel_settings_preference",
                  default: selected === "sel_settings_preference"
                }
              ]
            }
          ]
        },

        ...settingsPage
      ]
    }
  ];
}

// done so far!
function _cmd_settings_general(teapot, bot_user) {
  return [
    // USERNAME SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Display Name**
-# **${teapot.user.name}**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_username`,
        disabled: false
      }
    },
    // EMAIL SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Email**
-# **${bot_user.email}**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_email`,
        disabled: true
      }
    },
    // PROFILE PRIVACY SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Profile Privacy**
-# **${bot_user.settings.private ? "Only visible to you" : "Others can see your profile"}**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_privacy`,
        disabled: false
      }
    },
    // ACTIVE CONSOLE SETTING
    MessageComponent.Seperator(),
        MessageComponent.Text(`
**Linked Console**
-# **\`${teapot.user.cpukey}\`**
`)
  ];
}

// todo when i wake up
async function _cmd_settings_preference(teapot, bot_user) {
  return [
    // NOTIFICATION SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Notifications**
-# **Manage your server Notifications**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_toggle_notifications`,
        disabled: false
      }
    },
    // ENGINE SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Cheat Engines**
-# **Manage your Cheat Engines**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_toggle_cheats`,
        disabled: false
      }
    },
    // COLOR SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Color Scheme**
-# **[${await GetColorText(teapot.user.colors.dashbg.substring(2))}](https://www.thecolorapi.com/id?format=svg&hex=${teapot.user.colors.dashbg.substring(2)}&w=1280&h=720) - \`#${teapot.user.colors.dashbg.substring(2)}\`**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_colors`,
        disabled: true
      }
    },
    // AVATAR SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Avatar Preference**
-# **${avatarTypeLabel(bot_user.settings.avatar_type)}**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_avatar`,
        disabled: false
      }
    },
    // BANNER SETTING
    MessageComponent.Seperator(),
    {
      type: ComponentType.Section,
      components: [
        MessageComponent.Text(`
**Banner Preference**
-# **${bannerTypeLabel(bot_user.settings.banner_type)}**
`)
      ],
      accessory: {
        type: MessageComponentTypes.BUTTON,
        label: `Edit`,
        style: ButtonStyle.Secondary,
        custom_id: `btn_settings_change_banner`,
        disabled: false
      }
    }
  ];
}
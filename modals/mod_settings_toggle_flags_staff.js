import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl, Discord, AppWebhookEventType } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserAvatarType } from "../utils/teapot";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";
import { _profileComponent } from "../commands/cmd_profile";

import mod_onboarding_logon from "./mod_onboarding_logon";
import { hasFlag, UserFlags } from "../utils/flags";

/**
 * # Manage User (Admin)
 * Modal to manage a selected user
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  // CRITIAL PERMISSION CHECKPOINT !!!
  if (!hasFlag(bot_user.flags, UserFlags.STAFF))
    return new ClientError({ title: "Not Authorized", message: "This maze is not meant for you." }).ShowModal();
  // =====================================


  const targetDiscordUserId = interaction.data.values[0];

  const discord_user_target = interaction.data.resolved.users[targetDiscordUserId];

  //console.log(discord_user_target);

  const targetUser = await new TeapotBot(env).GetUser(discord_user_target);

  if (!targetUser) {
    return new ClientError({
      title: "User Not Found",
      message: "The selected user does not have an account."
    }).ShowModal();
  }

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Manage User`,
      custom_id: `mod_settings_toggle_flags_staff:${targetDiscordUserId}`,
      components: [
        {
          "type": ComponentType.Label,
          "label": "Permissions",
          "component": {
            "type": ComponentType.CheckboxGroup,
            "custom_id": "mod_settings_toggle_flags_staff:permissions",
            "min_values": 0,
            //"max_values": 3,
            "required": false,
            options: [
              {
                value: UserFlags.STAFF.toString(),
                label: "STAFF",
                default: hasFlag(targetUser.flags, UserFlags.STAFF)
              },
              {
                value: UserFlags.BUG_HUNTER.toString(),
                label: "BUG_HUNTER",
                default: hasFlag(targetUser.flags, UserFlags.BUG_HUNTER)
              },
              {
                value: UserFlags.BLACKLISTED.toString(),
                label: "BLACKLISTED",
                default: hasFlag(targetUser.flags, UserFlags.BLACKLISTED)
              },
              {
                value: UserFlags.QUARANTINED.toString(),
                label: "QUARANTINED",
                default: hasFlag(targetUser.flags, UserFlags.QUARANTINED)
              },
            ]
          }
        },
        {
          "type": ComponentType.Label,
          "label": "Badges & Awards",
          "component": {
            "type": ComponentType.CheckboxGroup,
            "custom_id": "mod_settings_toggle_flags_staff:badges",
            "min_values": 0,
            // "max_values": 2,
            "required": false,
            options: [
              {
                value: UserFlags.BADGE_SUPERIORITY.toString(),
                label: "BADGE_SUPERIORITY",
                default: hasFlag(targetUser.flags, UserFlags.BADGE_SUPERIORITY)
              },
              {
                value: UserFlags.BADGE_UNICORN.toString(),
                label: "BADGE_UNICORN",
                default: hasFlag(targetUser.flags, UserFlags.BADGE_UNICORN)
              }
            ]
          }
        },
        {
          type: ComponentType.TextDisplay,
          content:
            `-# **YOU ARE CURRENTLY EDITING USER: <@${targetDiscordUserId}>**`
        },
      ]
    }
  });
}

/**
 * # Modal Submit
 */
export async function mod_settings_toggle_flags_staff_submitted(interaction, env, ctx) {
  console.log(
    `[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`
  );

  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (!bot_user.email) {
    return mod_onboarding_logon(interaction, env, ctx);
  }

  // CRITIAL PERMISSION CHECKPOINT !!!
  if (!hasFlag(bot_user.flags, UserFlags.STAFF))
    return new ClientError({ title: "Not Authorized", message: "This maze is not meant for you." }).ShowUser();
  // =====================================

  const [, targetDiscordUserId] = interaction.data.custom_id.split(":");//allow arg passthru

  const discord_target = {
    id: targetDiscordUserId
  };

  const teapot_bot = new TeapotBot(env);

  const targetUser = await teapot_bot.GetUser(discord_target);

  if (!targetUser) {
    return new ClientError({
      title: "User Not Found",
      message: "The selected user no longer exists."
    }).ShowUser();
  }

  // collect flags selected in checkbox group
  let submittedFlags = UserFlags.NONE;

  for (const wrapper of interaction.data.components) {
    const component = wrapper.component;

    if (!component?.values) continue;

    for (const value of component.values) {
      submittedFlags |= Number(value);
    }
  }

  console.log("Submitted flags:", submittedFlags);

  const currentFlags = targetUser.flags ?? UserFlags.NONE;// curr
  const flagsToAdd = submittedFlags & ~currentFlags;// add requested
  const flagsToRemove = currentFlags & ~submittedFlags; // remove requested


  // get readable names for response
  const getFlagDebugNames = (flags) => {
    return Object.entries(UserFlags)
      .filter(([name, value]) => typeof value === "number" && value !== UserFlags.NONE)
      .filter(([name, value]) => flags & value)
      .map(([name, value]) => `${name} (${value})`);
  };

  const addedFlags = getFlagDebugNames(flagsToAdd);
  const removedFlags = getFlagDebugNames(flagsToRemove);


  // pop new badges out shitter
  for (const flag of Object.values(UserFlags).filter(v => typeof v === "number")) {
    if (flag === UserFlags.NONE) continue;

    if (flagsToAdd & flag) {
      await teapot_bot.AddFlag(discord_target, flag);
    }

    if (flagsToRemove & flag) {
      await teapot_bot.RemoveFlag(discord_target, flag);
    }
  }


  // CHANGELOG BUILDER
  let changelog = ``;

  changelog += `Before flags: \`${currentFlags}\`\n`;
  changelog += `After flags: \`${submittedFlags}\`\n\n`;

  if (addedFlags.length > 0) {
    changelog += `-# **ADDED FLAGS:**\n\`\`\`\n${addedFlags.join("\n")}\n\`\`\`\n`;
  }

  if (removedFlags.length > 0) {
    changelog += `-# **REMOVED FLAGS:**\n\`\`\`\n${removedFlags.join("\n")}\n\`\`\`\n`;
  }

  if (addedFlags.length === 0 && removedFlags.length === 0) {
    changelog += "No changes were made.";
  }


  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags:
        InteractionResponseFlags.IS_COMPONENTS_V2 |
        InteractionResponseFlags.EPHEMERAL,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [
            MessageComponent.Text(`Updated flags for <@${targetDiscordUserId}>`, 2),
            MessageComponent.Seperator(),
            MessageComponent.Text(changelog)
          ]
        }
      ]
    }
  });
}
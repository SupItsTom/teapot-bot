import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { ATXHeader, JsonResponse } from "../utils/client";
import { ButtonStyle } from "discord-api-types/v10";

// TODO: move to class 'DiscordUser'
export function getDiscordUser(interaction) {
  switch (interaction.context) {
    case 0: { // GUILD
      return interaction.member.user;
    }
    case 1: { // BOT_DM
      return interaction.user;
    }
    case 2: { // PRIVATE_CHANNEL
      return interaction.user;
    }
    default: {
      return console.error(`Unknown interaction context: ${interaction.context}. Unable to determine user.`);
    }
  }
}

// TODO: move to class 'DiscordUser'
export function getDisplayName(discordUser) {
  return `${discordUser.global_name ?? discordUser.username}`;
}

// TODO: move to class 'DiscordUser'
export function getAvatarUrl(discordUser) {
  if (!discordUser.avatar) {
    const defaultAvatarNumber = discordUser.discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
  }
  else {
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
  }
}

export class MessageComponent {

  /**
   * Creates a separator object for use in Discord message components.
   *
   * @param {boolean} [divider=true] - Indicates whether the separator includes a dividing line.
   * @param {number} [spacing=1] - Specifies the spacing around the separator (1 = small, 2 = large).
   * @returns {Object} An object representing the separator with type, divider, and spacing properties.
   */
  static Seperator(divider = true, spacing = 1) {

    // christmas style seperator
    return MessageComponent.Media('https://web-assets.cdn.supitstom.net/bot-teapot_christmas_seperator.png');

    return {
      type: MessageComponentTypes.SEPARATOR,
      divider: divider,
      spacing: spacing
    }
  }

  /**
   * Generates a text object with an optional ATX-style header prefix based on the specified header depth.
   *
   * @param {string} content - The main content of the text to be displayed.
   * @param {number} [headerDepth=0] - The depth of the ATX header. 
   *                                   - `-1` for sub-text,
   *                                   - `0` for normal text, 
   *                                   - `1` for header, 2 for sub-header,
   *                                   - `3` for sub-sub-header lol.
   *                                   - Defaults to 0 if not specified.
   * @returns {Object} An object representing the text component with the following properties:
   *                   - `type` {string}: The type of the message component (e.g., `MessageComponentTypes.TEXT_DISPLAY`).
   *                   - `content` {string}: The formatted content with the appropriate header prefix.
   */
  static Text(content, headerDepth = 0) {
    let header_indent = ``;

    switch (headerDepth) {
      case ATXHeader.Tiny:
        header_indent = `-# `;
        break;
      case ATXHeader.Normal:
        header_indent = ``;
        break;
      case ATXHeader.Large:
        header_indent = `# `;
        break;
      case ATXHeader.Medium:
        header_indent = `## `;
        break;
      case ATXHeader.Small:
        header_indent = `### `;
        break;
      default:
        console.warn(`Unknown ATX header depth: ${headerDepth}. Defaulting to no indent.`);
        header_indent = ``;
    }

    return {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `${header_indent}${content}`
    }
  }

  static Admonition(content) {
    let sidebar_color;

    switch (content.title) {
      case "warning":
        content.title = "⚠️ Warning";
        sidebar_color = 0xFFA500; // Orange
        break;
      case "info":
        content.title = "ⓘ Info";
        sidebar_color = 0x0000FF; // Blue
        break;
      case "tip":
        content.title = "💡 Tip";
        sidebar_color = 0x00FF00; // Green
        break;
      case "danger":
        content.title = "❌ Danger";
        sidebar_color = 0xFF0000; // Red
        break;
      default:
        sidebar_color = 0x808080; // Gray
        break;
    }

    return {
      type: MessageComponentTypes.CONTAINER,
      accent_color: sidebar_color || null,
      components: [

        MessageComponent.Text(`**${content.title}**`, -1),
        MessageComponent.Text(`${content.text}`, ATXHeader.None),
      ],
    }
  }

  /**
   * Creates a media gallery message component for Discord.
   *
   * @param {string} mediaUrl - The URL of the media to be displayed.
   * @param {Object} [options] - Optional settings for the media component.
   * @param {string} [options.description] - An accessible description for the media item.
   * @param {boolean} [options.spoiler] - Whether the media item should be marked as a spoiler.
   * @returns {Object} The media gallery message component object.
   */
  static Media(mediaUrl, options) {
    return {
      type: MessageComponentTypes.MEDIA_GALLERY,
      items: [
        {
          media: {
            url: `${mediaUrl}`,
          },
          description: options?.description,
          spoiler: options?.spoiler
        },
      ]
    }
  }

  static MediaGalleryItem(mediaUrl, options) {
    return {
      media: {
        url: `${mediaUrl}`,
      },
      description: options?.description,
      spoiler: options?.spoiler
    }
  }
}



export class ClientError {
  constructor(title, message) {
    this.title = title;
    this.message = message;
  }

  ShowUser() {

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,

        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [

              MessageComponent.Text(`**ERROR**`, ATXHeader.Tiny),

              {
                type: MessageComponentTypes.SECTION,
                components: [
                  MessageComponent.Text(`${this.title}`, ATXHeader.Small),
                  MessageComponent.Text(`${this.message}`, ATXHeader.Tiny),
                ],
                accessory: {
                  type: MessageComponentTypes.BUTTON,
                  label: "Learn More",
                  style: ButtonStyle.Link,
                  url: "https://supitstom.net/teapot-bot/errors#" + encodeURIComponent(this.title).replace(/%20/g, '-').toLowerCase(),
                  disabled: true
                }
              },

              MessageComponent.Seperator(),

              MessageComponent.Text(`If error persists, contact [SupItsTom](discord://-/users/820362947146153994) on Discord and attach a screenshot.`, ATXHeader.Tiny),
            ],
          },
        ]
      }
    });
  }
}



export async function sendDirectMessage(user, content, env) {

  // create and get dm channel id
  const _dm_channel = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${env.DISCORD_APPLICATION.TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
    },
    body: JSON.stringify({
      recipient_id: `${user.id}`
    })
  });

  const dm_channel = await _dm_channel.json();

  if (!dm_channel) console.error(`Failed to create DM channel with user '${user.id}'`)

  // send that shit
  const _prepare_message = await fetch(`https://discord.com/api/v10/channels/${dm_channel.id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${env.DISCORD_APPLICATION.TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
    },
    body: JSON.stringify({
      "flags": 32768,
      "components": [
        {
          "type": 17,
          "accent_color": null,
          "spoiler": false,
          "components": [
            {
              "type": 10,
              "content": `### Hey, <@${user.id}>`
            },
            {
              "type": 14,
              "divider": false,
              "spacing": 1
            },
            {
              "type": 10,
              "content": `${content}`
            }
          ]
        },
      ]
    })
  });

  const final_message = await _prepare_message.json();

  return final_message;

}
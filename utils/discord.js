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
  // Creates a separator object for use in Discord message components
  static Seperator(divider = true, spacing = 1) {
    return {
      type: MessageComponentTypes.SEPARATOR,
      divider: divider,
      spacing: spacing
    }
  }

  // Generates a text object with an optional ATX-style header prefix based on the specified header depth
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
        header_indent = ``;
    }

    return {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `${header_indent}${content}`
    }
  }

  // Media Gallery component
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

  // Media Gallery Item (needed?)
  static MediaGalleryItem(mediaUrl, options) {
    return {
      media: {
        url: `${mediaUrl}`,
      },
      description: options?.description,
      spoiler: options?.spoiler
    }
  }

  // File component
  static File(fileUrl) {
    return {
      type: MessageComponentTypes.FILE,
      file: { url: fileUrl }
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
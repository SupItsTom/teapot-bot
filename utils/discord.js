import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { ATXHeader, JsonResponse } from "../utils/client";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";

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
export function getAvatarUrl(discord_user, size = 256) {
  if (!discord_user?.id) return null;

  if (discord_user.avatar) {
    const extension = discord_user.avatar.startsWith("a_") ? "gif" : "png";

    return `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${extension}?size=${size}`;
  }

  // use the modulo'd default profile pic if none is available
  const defaultIndex = Number(BigInt(discord_user.id) >> 22n) % 6;

  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

// TODO: move to class 'DiscordUser'
export function getBannerUrl(discord_user, size = 1024) {
  if (!discord_user?.id) return null;

  if (!discord_user.banner) return null;

  const extension = discord_user.banner.startsWith("a_") ? "gif" : "png";

  return `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.${extension}?size=${size}`;
}

export const AppWebhookEventType = Object.freeze({
  USER_VAULT_LOG: "USER_VAULT_LOG",
  USER_LOBBY_CREATE: "USER_LOBBY_CREATE",
});

export class Discord {
  constructor(env) {
    this.env = env;

    this.webhooks = Object.freeze({
      [AppWebhookEventType.USER_VAULT_LOG]:
        env.DISCORD_APPLICATION.WEBHOOKS.USER_VAULT_LOG,
      [AppWebhookEventType.USER_LOBBY_CREATE]:
        env.DISCORD_APPLICATION.WEBHOOKS.USER_LOBBY_CREATE,
    });
  }

  async SendWebhookEvent(type, message) {
    const webhookUrl = this.webhooks[type];

    if (!webhookUrl) {
      throw new Error(`Invalid AppWebhookEventType: ${type}`);
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `[Discord:SendWebhookEvent]: ${response.status} - ${errorText}`
      );
    }

    return true;
  }


  async CreateGuildScheduledEvent({
    guildId,
    name,
    description = null,
    startTime = new Date(Date.now() + 10000).toISOString(),
    endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    entityType = 3,
    location = "Sex Dungeon",
    channelId = null
  }) {
    const url = `https://discord.com/api/v10/guilds/${guildId}/scheduled-events`;

    const body = {
      name,
      scheduled_start_time: startTime,
      scheduled_end_time: endTime,
      entity_type: entityType,
      privacy_level: 2
    };

    if (description) {
      body.description = description;
    }

    if (entityType === 3) {
      body.entity_metadata = {
        location
      };
    }

    if (entityType === 1 || entityType === 2) {
      body.channel_id = channelId;
    }

    console.log("[Discord:CreateGuildScheduledEvent] Request:");
    console.log(JSON.stringify({
      method: "POST",
      url,
      body
    }, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${this.env.DISCORD_APPLICATION.TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();

    console.log("[Discord:CreateGuildScheduledEvent] Response:");
    console.log(JSON.stringify({
      status: response.status,
      body: responseText
    }, null, 2));

    if (!response.ok) {
      throw new Error(
        `[Discord:CreateGuildScheduledEvent]: ${response.status} - ${responseText}`
      );
    }

    return JSON.parse(responseText);
  }


  async GetGuildScheduledEvents(guildId) {
    const url =
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events?with_user_count=false`;

    console.log("[Discord:GetGuildScheduledEvents] Request:");
    console.log(JSON.stringify({
      method: "GET",
      url
    }, null, 2));

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bot ${this.env.DISCORD_APPLICATION.TOKEN}`
      }
    });

    const responseText = await response.text();

    console.log("[Discord:GetGuildScheduledEvents] Response:");
    console.log(JSON.stringify({
      status: response.status,
      body: responseText
    }, null, 2));

    if (!response.ok) {
      throw new Error(
        `[Discord:GetGuildScheduledEvents]: ${response.status} - ${responseText}`
      );
    }

    return JSON.parse(responseText);
  }


  async DeleteGuildScheduledEvent(guildId, eventId) {
    const url =
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`;

    console.log("[Discord:DeleteGuildScheduledEvent] Request:");
    console.log(JSON.stringify({
      method: "DELETE",
      url
    }, null, 2));

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": `Bot ${this.env.DISCORD_APPLICATION.TOKEN}`
      }
    });

    const responseText = await response.text();

    console.log("[Discord:DeleteGuildScheduledEvent] Response:");
    console.log(JSON.stringify({
      status: response.status,
      body: responseText || "(empty)"
    }, null, 2));

    if (!response.ok) {
      throw new Error(
        `[Discord:DeleteGuildScheduledEvent]: ${response.status} - ${responseText}`
      );
    }

    return true;
  }


  async RemoveExistingLobbyEvent(guildId, gamertag) {
    console.log("[Discord:RemoveExistingLobbyEvent]");
    console.log(JSON.stringify({
      guildId,
      gamertag
    }, null, 2));

    const events = await this.GetGuildScheduledEvents(guildId);

    console.log("[Discord] Existing events:");
    console.log(JSON.stringify(
      events.map(event => ({
        id: event.id,
        name: event.name,
        location: event.entity_metadata?.location
      })),
      null,
      2
    ));

    const existingEvents = events.filter(event =>
      event.entity_metadata?.location?.includes(gamertag)
    );

    console.log("[Discord] Matching lobby events:");
    console.log(JSON.stringify(
      existingEvents.map(event => ({
        id: event.id,
        name: event.name
      })),
      null,
      2
    ));

    for (const event of existingEvents) {
      await this.DeleteGuildScheduledEvent(
        guildId,
        event.id
      );
    }

    return existingEvents.length > 0;
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
  constructor(error) {
    this.title = error.title;
    this.message = error.message;
    this.dev_json = JSON.stringify(error.json, null, 2);
  }

  ShowModal() {
    return new JsonResponse({
      type: InteractionResponseType.MODAL,
      data: {
        title: `An error occurred`,
        custom_id: "mod_errorui",
        components: [
          ...(this.title ? [{
            type: ComponentType.TextDisplay,
            content: `-# **ERROR**\n${this.title}`
          }] : []),

          ...(this.message ? [{
            type: ComponentType.TextDisplay,
            content: `-# **DESCRIPTION**\n${this.message}`
          }] : []),

          // ...(this.dev_json ? [{
          //   type: ComponentType.TextDisplay,
          //   content: `-# **ERROR DEBUG**\n\`\`\`json\n${this.dev_json}\`\`\``
          // }] : []),

          {
            type: ComponentType.TextDisplay,
            content: `-# *Click **Submit** to send a bug report, or **Cancel** to dismiss.*`
          }
        ]
      }
    });
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
              MessageComponent.Text(`If error persists, contact [SupItsTom](discord://-/users/95522978183258112) on Discord and attach a screenshot.`, ATXHeader.Tiny),
            ],
          },
        ]
      }
    });
  }
}
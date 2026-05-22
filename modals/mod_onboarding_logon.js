import { InteractionResponseFlags, InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { getDiscordUser, MessageComponent, ClientError, getAvatarUrl } from "../utils/discord";
import { postTeapotRequest, TeapotBot, UserAvatarType } from "../utils/teapot";
import { Xbox } from "../utils/xbox";
import { Badges } from "../utils/badges";

/**
 * # Sign-in Modal (onboarding)
 */
export default async function (interaction, env, ctx) {
  const discord_user = await getDiscordUser(interaction);
  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  if (bot_user) {
    return new ClientError(
      `Already Connected`,
      `This Discord account (${discord_user.username}) is already connected to a Teapot account.`
    ).ShowUser();
  }

  return new JsonResponse({
    type: InteractionResponseType.MODAL,
    data: {
      title: `Login to Teapot Live`,
      custom_id: "mod_onboarding_logon",
      components: [
        {
          type: ComponentType.Label,
          label: "Email",
          description: "Enter the Email associated with your account",
          component: {
            type: MessageComponentTypes.INPUT_TEXT,
            custom_id: "mod_onboarding_logon:email",
            style: TextInputStyle.Short,
            min_length: 3,
            max_length: 254,
            required: true
          }
        },
        {
          type: ComponentType.Label,
          label: "CPU Key",
          description: "Enter the CPU Key associated with your account",
          component: {
            type: MessageComponentTypes.INPUT_TEXT,
            custom_id: "mod_onboarding_logon:cpukey",
            style: TextInputStyle.Short,
            min_length: 32,
            max_length: 32,
            required: true
          }
        },
        {
          type: ComponentType.Label,
          label: "Who can see your profile?",
          component: {
            type: ComponentType.RadioGroup,
            custom_id: "mod_onboarding_logon:privacy_type",
            options: [
              {
                value: "public",
                label: "Everyone on Discord",
                description: "Your profile is visible to server members.",
                default: true
              },
              {
                value: "private",
                label: "Only Me",
                description: "Only you can see your profile.",
                default: false
              }
            ]
          }
        },
        {
          type: ComponentType.TextDisplay,
          content:
            "-# Once submitted, this account will be permanently linked to your Discord."
        }
      ]
    }
  });
}

/**
 * # Modal Submit
 */
export async function mod_onboarding_logon_submitted(interaction, env, ctx) {
  console.log(`[${InteractionType[interaction.type]}]: Got components: ${JSON.stringify(interaction.data.components)}`);

  const _email_requested = interaction.data.components[0].component.value;
  const _cpukey_requested = interaction.data.components[1].component.value;
  const _privacy_requested = interaction.data.components[2].component.value;

  const discord_user = await getDiscordUser(interaction);

  let _teapot_are_we_registered = await postTeapotRequest(env, {
    action: "link",
    email: _email_requested
  });

  console.info(
    `[onboarding] ${discord_user.id} (${_email_requested}) privacy=${_privacy_requested}`
  );

  if (!_teapot_are_we_registered.status) {
    return new ClientError(
      `Console not found`,
      `The information you provided isn't correct.`
    ).ShowUser();
  }

  const teapot = await postTeapotRequest(env, {
    action: "overview",
    email: _email_requested
  });

  if (teapot.user.cpukey !== _cpukey_requested) {
    return new ClientError(
      `Console not found`,
      `The information you provided isn't correct.`
    ).ShowUser();
  }

  await new TeapotBot(env).RegisterUser(discord_user, _email_requested, {
    private: _privacy_requested === "private"
  });

  const bot_user = await new TeapotBot(env).GetUser(discord_user);

  let _profile_badges = await new Badges(env, discord_user).GetAll();
  let _game_info = await new Xbox().GetGameFromTitleID(teapot.user.title.id);

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
            MessageComponent.Text("**CONNECTION SUCCESSFUL**", -1),

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
                  url: bot_user.settings.avatar_type === UserAvatarType.GAMERPIC
                    ? `http://avatar.xboxlive.com/avatar/${encodeURIComponent(teapot.user.gamertag.trim())}/avatarpic-l.png`
                    : getAvatarUrl(discord_user)
                }
              }
            },

            MessageComponent.Seperator(),

            MessageComponent.Text("**WHERE TO NEXT?**", -1),

            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyle.Primary,
                  label: "See Profile",
                  custom_id: "btn_profile"
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyle.Link,
                  label: "Learn More",
                  url: "https://supitstom.net/teapot-bot"
                }
              ]
            }
          ]
        }
      ]
    }
  });
}
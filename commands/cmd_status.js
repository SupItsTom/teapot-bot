import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { ATXHeader, JsonResponse, numberWithCommas } from "../utils/client.js";
import { MessageComponent } from "../utils/discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import { postTeapotRequest } from "../utils/teapot.js";
import { BetterStack } from "../utils/uptime.js";

import buildnotes from "../metadata/strings/changelog.js";
import { Flairs } from "../utils/flairs.js";

/**
 * # Stats Command
 * Get bot and server statistics
 */
export default async function (interaction, env, ctx) {

  const stats = await postTeapotRequest(env, { action: "get_stats_filter" });

  var bs_teapot_monitor_group = "1368667";
  let _uptime_info = await new BetterStack(env).GetMonitorsInGroup(bs_teapot_monitor_group);

  //await console.log(env.CF_VERSION_METADATA)

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**SERVICE STATISTICS**`, -1),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`Teapot Live`, 3),
                MessageComponent.Text(`<:Online:1447729534559326279> ${numberWithCommas(stats.statArr.online)} Online <:Offline:1447729532558643210> ${numberWithCommas(stats.statArr.total)} Users`, -1),
              ],
              accessory: {
                type: MessageComponentTypes.BUTTON,
                label: "System Status",
                style: ButtonStyle.Link,
                url: "https://status.supitstom.net",
              }
            },

            MessageComponent.Seperator(),

            MessageComponent.Text(`**SYSTEM STATUS**`, -1),

            ..._uptime_info.data.map((monitor) => {

              console.log(`cmd_stats: ${monitor.attributes.pronounceable_name}(${monitor.id}) => ${monitor.attributes.status} as of ${monitor.attributes.last_checked_at}`);

              return {
                type: MessageComponentTypes.SECTION,
                components: [
                  MessageComponent.Text(`${monitor.attributes.pronounceable_name}`, 3),
                  MessageComponent.Text(`Last Checked: <t:${Math.floor(new Date(monitor.attributes.last_checked_at) / 1000)}:R>`, -1),
                ],
                accessory: _getButtonForStatus(monitor),
              };
            }),



          ],
        },

        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            MessageComponent.Text(`**DEVELOPMENT INFO**`, -1),

            MessageComponent.Text(`Application Version`, 3),
            MessageComponent.Text(`Version ID: \`${env.CF_VERSION_METADATA.id === '' ? 'Development Server' : env.CF_VERSION_METADATA.id}\`\nUpdated: <t:${Math.floor(new Date(env.CF_VERSION_METADATA.timestamp) / 1000)}:F> - <t:${Math.floor(new Date(env.CF_VERSION_METADATA.timestamp) / 1000)}:R>\n`, ATXHeader.None),
          ],
        },

        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyle.Secondary,
              label: 'Whats New?',
              custom_id: 'btn_whats_new',
            },
          ]
        },
      ]
    }
  });
}

function _getButtonForStatus(monitor) {

  let style;
  let label;
  let id;

  const normalizedStatus = (monitor.attributes.status || '').toLowerCase();

  switch (normalizedStatus) {
    case 'up':
      style = ButtonStyle.Success;
      label = 'Online';
      id = monitor.id;
      break;
    case 'down':
      style = ButtonStyle.Danger;
      label = 'Offline';
      id = monitor.id;
      break;
    case 'paused':
    case 'pending':
    case 'validating':
      style = ButtonStyle.Secondary;
      label = 'Paused';
      id = monitor.id;
      break;
    case 'maintenance':
      style = ButtonStyle.Primary;
      label = 'Maintenance';
      id = monitor.id;
      break;
    default:
      style = ButtonStyle.Secondary;
      label = 'Unknown';
      id = 'default_unknown_monitor_status';
      break;
  }

  console.log(`cmd_stats: ${JSON.stringify({
    type: MessageComponentTypes.BUTTON,
    style,
    label,
    custom_id: id,
  })}`)

  return {
    type: MessageComponentTypes.BUTTON,
    style,
    label,
    custom_id: id,
    disabled: true
  };
}
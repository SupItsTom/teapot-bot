import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Xbox } from "../utils/xbox";

/**
 * # Game Command
 * Fetch Xbox 360 Marketplace content by Title ID
 */
export default async function (interaction, env, ctx) {

  let titleId = interaction.data.options[0].options[0].value;

  let _game_info = await new Xbox().GetGameFromTitleID(titleId);

 

  if (!_game_info) {
    return new ClientError("Title Not Found", `Title found but unable to get it's Product ID for more details.`).ShowUser();
  }
  
  if (!_game_info.bing_id) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
  
        components: [
          
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              //...(_game_info ? [MessageComponent.Media(`http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`, { description: `Game banner for '${_game_info.name}'` })] : []),
  
              MessageComponent.Text(`${_game_info.name}`, 2),
              MessageComponent.Text(`-# Title ID: **${_game_info.title_id}**`),
  
            ]
          },
          MessageComponent.Text(`Unable to gather detailed information for this title due to it being unlisted.`, -1),
        ]
      }
    });
  }

  let _product_info = await new Xbox().GetMarketplaceProduct(_game_info.bing_id);
  let _product_addons = await new Xbox().GetMarketplaceProductAddons(_game_info.bing_id);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,

      components: [
        //MessageComponent.Text(`This command uses data provided by **[SerialStation](https://serialstation.com/)**.`, -1),
        {
          type: MessageComponentTypes.CONTAINER,
          components: [

            ...(_game_info ? [MessageComponent.Media(`http://download.xbox.com/content/images/${_game_info.bing_id}/banner.png`, { description: `Game banner for '${_game_info.name}'` })] : []),

            {
              type: MessageComponentTypes.SECTION,
              components: [
                MessageComponent.Text(`[${_game_info.name}](https://dbox.tools/marketplace/products/${_game_info.bing_id})`, 2),
                MessageComponent.Text(`-# Release Date: **<t:${new Date(_product_info.global_original_release_date).getTime() / 1000}:d>**\n-# Title ID: **${_product_info.title_id}**\n-# Developer: **${_product_info.developer_name}**\n-# Publisher: **${_product_info.publisher_name}**`),
              ],
              accessory: {
                type: ComponentType.Thumbnail,
                media: {
                  url: `http://download.xbox.com/content/images/${_game_info.bing_id}/tile.png`
                }
              }
            },

            ...(_product_addons && _product_addons.length > 0
              ? [
                  MessageComponent.Seperator(),
                  MessageComponent.Text(
                    `-# **DLC PACKS**\n${_product_addons
                      .slice(0, 5)
                      .map(a => `- [${a.default_title}](https://dbox.tools/marketplace/products/${a.product_id})`)
                      .join('\n')}${_product_addons.length > 5 ? `\n- and ${_product_addons.length - 5} more...` : ''}`,
                    0 // or 3 for smaller style
                  ),
                ]
              : []),

          ]
        },

        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyle.Link,
              label: 'See More Information',
              url: `https://dbox.tools/marketplace/products/${_game_info.bing_id}`,
            },
          ]
        },
      ]
    }
  });
}
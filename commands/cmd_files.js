import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, MessageComponent } from "../utils/discord";
import { ButtonStyle } from "discord-api-types/v10";

/**
 * # Files Command
 * Returns upto-date files
 */
export default async function (interaction, env, ctx) {

  // lazy load those large ass files
  ctx.waitUntil(_defer_file_upload(interaction, env));

  return new Response(JSON.stringify({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
  }), {
    headers: { "Content-Type": "application/json" }
  });
}


async function _defer_file_upload(interaction, env){
  const [_files_teapot_standard_zip, _files_teapot_core_zip, _files_teapot_xdk_zip] = await Promise.all([
    fetch("https://xboxstealth.net/DL/XBLStealth.zip"),
    fetch("https://xboxstealth.net/DL/XBLStealth-Lite.zip"),
    fetch("https://xboxstealth.net/DL/XBLStealth-XDK.zip")
  ]);

  // check files are doing ok :D
  if (!_files_teapot_standard_zip.ok || !_files_teapot_core_zip.ok || !_files_teapot_xdk_zip.ok) {
    await new ClientError("Network Error", "Failed to retrieve file data.")
    return;
  }

  // parse file buffers
  const [_files_teapot_standard_buffer, _files_teapot_core_buffer, _files_teapot_xdk_buffer] = await Promise.all([
    _files_teapot_standard_zip.arrayBuffer(),
    _files_teapot_core_zip.arrayBuffer(),
    _files_teapot_xdk_zip.arrayBuffer()
  ]);

  const payload = new FormData();

  payload.append("payload_json", JSON.stringify({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    allowed_mentions: { parse: [] },
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,

    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        components: [

          MessageComponent.Text(`**XBLS: STANDARD EDITION**`, -1),
          MessageComponent.Text("Client for RGH, JTAG & Retail consoles.", 0),
          MessageComponent.File("attachment://xbls.zip"),
        ]
      },
      {
        type: MessageComponentTypes.CONTAINER,
        components: [

          MessageComponent.Text(`**XBLS: CORE EDITION**`, -1),
          MessageComponent.Text("The free alternative to the standard edition.", 0),
          MessageComponent.File("attachment://xbls-core.zip"),
        ]
      },
      {
        type: MessageComponentTypes.CONTAINER,
        components: [

          MessageComponent.Text(`**XBLS: XDK EDITION**`, -1),
          MessageComponent.Text("Client for Xbox 360 Development Kits.", 0),
          MessageComponent.File("attachment://xbls-devkit.zip"),
        ]
      }
    ]
  }));

  payload.append("files[0]", new Blob([_files_teapot_standard_buffer]), "xbls.zip");
  payload.append("files[1]", new Blob([_files_teapot_core_buffer]), "xbls-core.zip");
  payload.append("files[2]", new Blob([_files_teapot_xdk_buffer]), "xbls-devkit.zip");

  // follow up
  await fetch(
    `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION.CLIENT_ID}/${interaction.token}`,
    {
      method: "POST",
      body: payload
    }
  );
}
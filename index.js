import { verifyKey } from "discord-interactions";
import { AutoRouter, error } from "itty-router";
import interactions from "./endpoints/interactions";
import { dropRequest } from "./utils/client";
import webhooks from "./endpoints/webhooks";
import link from "./endpoints/link";

// index.js

const router = AutoRouter();

router.get("/", (request, env, ctx) => Response.redirect(`https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION.CLIENT_ID}`));

router.post("/interactions", (request, env, ctx) => {
  return interactions(request, env, ctx);
})

router.post("/webhooks", (request, env, ctx) => {
  return webhooks(request, env, ctx);
})

router.get("/link", (request, env, ctx) => {
  return link(request, env, ctx);
});

router.all("*", () => dropRequest(418));

export default {
  async fetch(request, env, ctx) {

    const { method, headers } = request;
    if (method === "POST") {
      const signature = headers.get("x-signature-ed25519");
      const timestamp = headers.get("x-signature-timestamp");
      const body = await request.clone().arrayBuffer();
      const isValidRequest = await verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_APPLICATION.PUBLIC_KEY
      );
      if (!isValidRequest) {
        return new Response("Bad request signature.", { status: 401 });
      }
    }

    return router.fetch(request, env, ctx)
  },
};

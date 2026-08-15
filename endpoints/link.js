import { TeapotBot, postTeapotRequest } from "../utils/teapot";
import { getDisplayName } from "../utils/discord";

import { ConnectionResult } from "../web/components/ConnectionResult";
import { renderPage } from "../web/templates/default";

//-----------------------------------------------------------------------------
// Purpose: Entry point to handle Discord OAuth2 linking
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
  console.log("[app]: Incoming link request");

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      throw new Error(
        "No handoff code was provided"
      );
    }

    console.info("[endpoints:link] Incoming OAuth request");

    // Exchange the Discord OAuth2 authorization code for an access token.
    const tokenResponse = await _exchangeCode(code, env);

    if (!tokenResponse?.access_token) {
      throw new Error(
        "Did not receive access code during exchange"
      );
    }

    return await _updateRoleConnection(
      tokenResponse.access_token,
      env
    );
  } catch (error) {
    console.error(
      "[endpoints:link]: " + error
    );

    return _htmlResponse(
      ConnectionResult({
        success: false,
        title: "Connection Failed",
        description:
          error instanceof Error
            ? error.message
            : String(error),
        tip:
          "You can close this window and try again.",
      })
    );
  }
}

//-----------------------------------------------------------------------------
// Purpose: Exchange OAuth2 authorization code for access token
//-----------------------------------------------------------------------------
async function _exchangeCode(code, env) {
  const params = new URLSearchParams({
    client_id: env.DISCORD_APPLICATION.CLIENT_ID,
    client_secret: env.DISCORD_APPLICATION.CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.DISCORD_APPLICATION.REDIRECT_URI,
  });

  const res = await fetch(
    "https://discord.com/api/v10/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  if (!res.ok) {
    const errText = await res.text();

    throw new Error(
      `Failed to exchange authorization code for access token due to it being invalid or already used`
    );
  }

  const data = await res.json();

  if (!data?.access_token) {
    throw new Error(
      "Did not receive access codes from Discord"
    );
  }

  return data;
}

//-----------------------------------------------------------------------------
// Purpose: Get the Discord user associated with the OAuth token
//-----------------------------------------------------------------------------
async function _getUserInfo(accessToken) {
  const res = await fetch(
    "https://discord.com/api/v10/oauth2/@me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();

    throw new Error(
      `Failed to get user details from access code`
    );
  }

  return await res.json();
}

//-----------------------------------------------------------------------------
// Purpose: Update Linked Role connection metadata
//-----------------------------------------------------------------------------
async function _updateRoleConnection(
  accessToken,
  env
) {
  //-------------------------------------------------------------------------
  // Get discord user information
  //-------------------------------------------------------------------------

  const discordUser = await _getUserInfo(accessToken);

  console.log(
    `[endpoints:link] Discord user: ${getDisplayName(
      discordUser.user
    )}`
  );

  if (!discordUser?.user) {
    throw new Error(
      "Did not receive user details from Discord"
    );
  }

  //-------------------------------------------------------------------------
  // Get Teapot account for this discord user
  //-------------------------------------------------------------------------

  const bot = new TeapotBot(env);
  const botUser = await bot.GetUser(discordUser.user);

  if (!botUser?.email) {
    throw new Error(
      "Could not find a Teapot account linked to Discord"
    );
  }

  //-------------------------------------------------------------------------
  // Get Teapot user
  //-------------------------------------------------------------------------

  const teapot = await postTeapotRequest(env, {
    action: "overview",
    email: botUser.email,
  });

  if (!teapot?.user) {
    throw new Error(
      "Teapot API returned an invalid account response"
    );
  }

  //-------------------------------------------------------------------------
  // Update Linked Role connection
  //-------------------------------------------------------------------------

  const metadata = {
    is_lifetime: teapot.user.timeleft?.lifetime ? 1 : 0,
    is_premium: teapot.user.timeleft?.premium ? 1 : 0,
    challenges: Number(teapot.user.xke_count || 0),
  };

  console.info(
    `[endpoints:link] Updating role connection for ${teapot.user.name}`
  );

  const res = await fetch(
    `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_APPLICATION.CLIENT_ID}/role-connection`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform_username: teapot.user.name,
        metadata,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();

    throw new Error(
      `Failed to update role metadata`
    );
  }

  //-------------------------------------------------------------------------
  // All Good!!!
  //-------------------------------------------------------------------------

  console.info(
    `[endpoints:link] Successfully connected Teapot account "${teapot.user.name}" to Discord user "${getDisplayName(
      discordUser.user
    )}"`
  );

  return _htmlResponse(
    ConnectionResult({
      success: true,
      title: "Connected Successfully",
      description:
        "Your Teapot account is now connected to Discord",
      tip:
        "You can close this window and go back to Discord.",
      discordUser: discordUser.user,
      teapotUser: teapot.user,
    })
  );
}

//-----------------------------------------------------------------------------
// Purpose: Renders the HTML response for user's browser
//-----------------------------------------------------------------------------
function _htmlResponse(content) {
  return new Response(renderPage(content), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
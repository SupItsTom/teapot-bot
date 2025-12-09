import { postTeapotRequest, TeapotBot } from "../utils/teapot";
import { dropRequest } from "../utils/client";
import { getDisplayName } from "../utils/discord";

//-----------------------------------------------------------------------------
// Purpose: Entry point to handle various command types
//-----------------------------------------------------------------------------
export default async function (request, env, ctx) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(_htmlToClient({ title: `Invalid Code`, info: `No handoff code was provided.`, tip: ``, code: '' }, request, env), {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }

    console.info(`[endpoints:link] incoming request with code ${code}`);

    // swap code for access token
    const tokenResponse = await _exchangeCode(code, env);

    // update connection metadata from bearer above (could store it and refresh automatically )
    return _updateRoleConnection(tokenResponse.access_token, env, request);

    
  } catch (error) {
    console.error(`[endpoints:link] error processing link request:`, error);
    return new Response(_htmlToClient({ title: `Connection Failed`, info: `Failed to connect your <strong>Teapot</strong> account to <strong>Discord</strong>.`, tip: `Close this tab and try again.`, code: `${JSON.parse(error.message).error_description}` }), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Purpose: Exchange OAuth2 code for access token
//-----------------------------------------------------------------------------
async function _exchangeCode(code, env) {
  const params = new URLSearchParams({
    client_id: env.DISCORD_APPLICATION.CLIENT_ID,
    client_secret: env.DISCORD_APPLICATION.CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.DISCORD_APPLICATION.REDIRECT_URI,
  });

  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${errText}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error("Missing access_token in Discord response.");

  return data;
}

//-----------------------------------------------------------------------------
// Purpose: Get Discord user info
//-----------------------------------------------------------------------------
async function _getUserInfo(access_token) {
  const res = await fetch("https://discord.com/api/v10/oauth2/@me", {
    method: "GET",
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${errText}`);
  }

  return await res.json();
}

//-----------------------------------------------------------------------------
// Purpose: Update Linked Role connection with external account data
//-----------------------------------------------------------------------------
async function _updateRoleConnection(access_token, env, request) {
  const discord_user = await _getUserInfo(access_token);
  console.log(`[endpoints:link] Discord user info: ${JSON.stringify(discord_user, null, 2)}`);

  const bot = new TeapotBot(env);
  const bot_user = await bot.GetUser(discord_user.user);

  if (!bot_user?.email) {
    return new Response(_htmlToClient({ title: `Connection Failed`, info: `No consoles linked to Teapot Bot.`, tip: `Link an account first and try again.`, code: '' }, request, env), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  const teapot = await postTeapotRequest(env, { action: "overview", email: bot_user.email });
  if (!teapot?.user) throw new Error("Invalid Teapot API response.");

  // type check :p
  const metadata = {
    is_lifetime: teapot.user.timeleft?.lifetime ? 1 : 0,
    is_premium: teapot.user.timeleft?.premium ? 1 : 0,
    challenges: Number(teapot.user.xke_count || 0),
  };

  console.info(`[endpoints:link] Updating role connection for ${teapot.user.name}`);

  const res = await fetch(
    `https://discord.com/api/v10/users/@me/applications/${env.DISCORD_APPLICATION.CLIENT_ID}/role-connection`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //platform_name: "Teapot Live",
        platform_username: teapot.user.name,
        metadata,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status} ${errText}`);
  }

  return new Response(_htmlToClient({ title: `Role Metadata Updated!`, info: `Connected your <strong>Teapot</strong> account to <strong>Discord</strong>.`, tip: `You can close this tab and go back to Discord.`, code: `[TEAPOT] ${teapot.user.name} => [DISCORD] ${getDisplayName(discord_user.user)}` }), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });

  return await res.json();
}


// ------------------------------

function _htmlToClient(content){

return `<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta charset="utf-8">
  <title>Teapot Bot</title>
  <link rel="icon" type="image/x-icon" href="https://cdn.discordapp.com/favicon.ico">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0
    }

    @font-face {
      font-family: ABC Ginto Nord;
      font-weight: 800;
      src: url(/assets/3d07f5abf272fbb5670d02ed687453d0.woff2) format('woff2')
    }

    @font-face {
      font-family: gg sans;
      font-weight: 400;
      src: url(/assets/3d6549bf2f38372c054eafb93fa358a9.woff2) format('woff2')
    }

    :root {
      --bg: #fff;
      --fg: #000;
      --link: #006be7
    }

    @media (prefers-color-scheme:dark) {
      :root {
        --bg: #313338;
        --fg: #fff;
        --link: #00aafc
      }
    }

    body {
      font: 18px gg sans, 'Helvetica Neue', Arial, sans-serif;
      max-width: 760px;
      margin: 0 auto;
      line-height: 1.5;
      padding: 0 24px;
      background: var(--bg);
      color: var(--fg)
    }

    body>* {
      padding: 24px 0
    }

    main {
      display: flex;
      flex-direction: column;
      gap: 1em
    }

    h1 {
      font-family: 'ABC Ginto Nord', 'Helvetica Neue', Arial, sans-serif;
      font-size: 32px;
      white-space: balance
    }

    button {
      all: unset
    }

    a,
    button {
      color: var(--link);
      text-decoration: underline;
      cursor: pointer
    }

    #home {
      color: inherit
    }

    #code {
      font-size: 16px;
      line-height: 24px;
      font-family: monospace
    }
  </style>
</head>

<body>
  <header aria-hidden="true"><a href="https://discord.com/" target="_blank" aria-label="Discord" id="home">
      <svg width="124" height="34">
        <g fill="currentColor">
          <path
            d="M26.002 6.953c-2-.915-4.123-1.581-6.34-1.953-.279.48-.589 1.131-.806 1.643a24.233 24.233 0 0 0-7.022 0A20.16 20.16 0 0 0 11.028 5a24.937 24.937 0 0 0-6.341 1.953C.673 12.873-.413 18.655.13 24.358c2.666 1.938 5.239 3.116 7.767 3.89a18.896 18.896 0 0 0 1.658-2.68 16.264 16.264 0 0 1-2.62-1.256c.218-.155.435-.325.636-.496 5.053 2.31 10.526 2.31 15.517 0 .217.17.418.341.635.496-.837.496-1.705.915-2.62 1.255.481.946 1.04 1.845 1.66 2.682a25.694 25.694 0 0 0 7.766-3.89c.666-6.603-1.056-12.338-4.527-17.406ZM10.252 20.84c-1.518 0-2.758-1.38-2.758-3.069s1.209-3.069 2.759-3.069c1.534 0 2.79 1.38 2.758 3.07 0 1.689-1.224 3.068-2.758 3.068Zm10.185 0c-1.519 0-2.76-1.38-2.76-3.069s1.21-3.069 2.76-3.069c1.535 0 2.79 1.38 2.76 3.07 0 1.689-1.21 3.068-2.76 3.068ZM41.27 9.866h6.588c1.581 0 2.93.248 4.03.744s1.922 1.178 2.465 2.062c.542.883.821 1.89.821 3.037 0 1.116-.279 2.124-.852 3.038-.574.9-1.442 1.628-2.604 2.155-1.163.527-2.604.79-4.325.79H41.27V9.866Zm6.046 8.82c1.07 0 1.89-.264 2.464-.807.574-.527.868-1.27.868-2.185 0-.853-.263-1.535-.775-2.046-.511-.511-1.286-.775-2.325-.775h-2.06v5.812h1.828ZM65.436 21.677c-.914-.232-1.736-.573-2.464-1.038v-2.805c.558.433 1.286.774 2.216 1.053.93.28 1.83.419 2.697.419.403 0 .713-.047.914-.155.202-.108.31-.232.31-.387 0-.171-.061-.31-.17-.419-.108-.108-.325-.201-.651-.294l-2.03-.45c-1.163-.263-1.984-.65-2.48-1.116-.496-.465-.729-1.1-.729-1.875 0-.651.217-1.225.636-1.705.434-.48 1.038-.853 1.829-1.116.79-.264 1.705-.403 2.774-.403.946 0 1.813.093 2.604.31.79.201 1.441.465 1.953.775v2.65a7.522 7.522 0 0 0-1.83-.744 8.265 8.265 0 0 0-2.138-.279c-1.054 0-1.58.186-1.58.543 0 .17.077.294.247.387.17.093.465.17.899.264l1.69.31c1.1.186 1.921.527 2.464 1.007.542.48.806 1.178.806 2.123 0 1.024-.45 1.845-1.349 2.434-.899.604-2.17.899-3.813.899-.96-.031-1.89-.155-2.805-.388ZM77.59 21.321c-.962-.48-1.706-1.116-2.186-1.922-.496-.806-.729-1.72-.729-2.743 0-1.007.248-1.922.76-2.712.511-.806 1.255-1.426 2.232-1.891.976-.45 2.154-.682 3.518-.682 1.69 0 3.084.356 4.2 1.07v3.084a4.941 4.941 0 0 0-1.38-.651 5.402 5.402 0 0 0-1.673-.248c-1.054 0-1.86.186-2.464.573-.59.388-.884.884-.884 1.504 0 .604.279 1.1.868 1.488.573.387 1.41.588 2.495.588.558 0 1.116-.077 1.659-.248.542-.17 1.023-.356 1.41-.604v2.991c-1.24.744-2.681 1.116-4.309 1.116-1.379 0-2.541-.248-3.518-.713ZM89.804 21.321c-.976-.48-1.72-1.116-2.232-1.937a5.106 5.106 0 0 1-.775-2.759c0-1.007.264-1.922.775-2.712.512-.79 1.256-1.41 2.217-1.86.96-.45 2.123-.682 3.457-.682 1.333 0 2.496.217 3.457.682.96.45 1.705 1.07 2.216 1.86.512.79.76 1.69.76 2.712 0 1.008-.248 1.937-.76 2.759-.511.821-1.24 1.472-2.216 1.937-.977.465-2.124.713-3.457.713-1.319 0-2.465-.248-3.442-.713Zm5.132-2.991c.403-.403.62-.961.62-1.627 0-.682-.202-1.21-.62-1.612-.419-.403-.977-.605-1.674-.605-.728 0-1.288.202-1.707.605-.403.403-.62.93-.62 1.612 0 .681.202 1.224.62 1.627.419.418.978.62 1.707.62.697-.016 1.27-.217 1.674-.62ZM110.048 11.99v3.643c-.434-.28-.992-.419-1.674-.419-.899 0-1.597.279-2.077.821-.481.543-.729 1.395-.729 2.542v3.1h-4.138V11.82h4.061v3.146c.217-1.147.589-2 1.085-2.542.496-.542 1.147-.837 1.937-.837.589 0 1.101.14 1.535.403ZM124 9.526v12.166h-4.138v-2.216c-.357.837-.884 1.473-1.597 1.907-.714.434-1.598.65-2.652.65-.93 0-1.751-.232-2.449-.681-.697-.45-1.239-1.085-1.611-1.876-.372-.806-.558-1.705-.558-2.697-.016-1.038.186-1.968.604-2.79a4.637 4.637 0 0 1 1.736-1.921c.744-.466 1.596-.698 2.557-.698 1.969 0 3.288.853 3.97 2.573V9.526H124Zm-4.758 8.726c.418-.403.635-.946.635-1.597 0-.635-.201-1.147-.62-1.534-.418-.388-.976-.59-1.675-.59-.698 0-1.256.202-1.674.605-.419.403-.62.915-.62 1.566 0 .65.201 1.162.62 1.565.418.403.961.605 1.658.605.699 0 1.257-.202 1.676-.62ZM58.989 12.41c1.188 0 2.154-.868 2.154-1.938 0-1.07-.966-1.938-2.154-1.938-1.19 0-2.155.868-2.155 1.938 0 1.07.964 1.937 2.154 1.937ZM61.143 13.741c-1.318.573-2.96.589-4.309 0v7.951h4.309v-7.951Z">
          </path>
        </g>
      </svg>
    </a>
  </header>
  <main>
    <h1>${content.title}</h1>
    <p>${content.info}</p>
    <p>${content.tip}</p>
    <p id="code">${content.code}</p>
  </main>
</body>

</html>`
}
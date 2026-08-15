import { getAvatarUrl, getDisplayName } from "../../utils/discord";

export function ConnectionResult({
  success = true,
  title = "Connection unknown",
  description = "An unknown error occurred.",
  tip,
  discordUser,
  teapotUser,
}) {
  const discordName = discordUser
    ? getDisplayName(discordUser)
    : null;

  const avatar = discordUser
    ? getAvatarUrl(discordUser)
    : null;

  // error icon & avatar fallback
  const errorIcon = "/app-assets/pepehands.png";

  return `
    <div class="oauth-page">
      <main class="oauth-card">

        <img
          class="oauth-avatar ${success && avatar ? "" : "oauth-avatar--error"}"
          src="${success && avatar ? avatar : errorIcon}"
          alt=""
        >

        <h1>${title}</h1>

        <p class="oauth-description">
          ${description}
        </p>

        ${
          success && teapotUser && discordUser
            ? `
              <div class="oauth-connection">

                <div class="oauth-account">
                  <div class="oauth-account__details">
                    <span>Teapot</span>
                    <strong>${teapotUser.name}</strong>
                  </div>
                </div>

                <div
                  class="oauth-arrow"
                  aria-hidden="true"
                >
                  •••
                </div>

                <div class="oauth-account">
                  <div class="oauth-account__details">
                    <span>Discord</span>
                    <strong>${discordName}</strong>
                  </div>
                </div>

              </div>
            `
            : ""
        }

        ${
          tip
            ? `
              <p class="oauth-tip">
                ${tip}
              </p>
            `
            : ""
        }

        
        <button
          class="button button--primary button--block oauth-close"
          onclick="window.close()"
        >
          Close
        </button>

      </main>
    </div>
  `;
}
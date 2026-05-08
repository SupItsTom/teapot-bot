import { BetterStack } from "./uptime";

/**
 * Sends a POST request to the Teapot API with the provided data.
 *
 * @param {Object} env - The environment configuration object.
 * @param {Object} data - The data to be sent in the request.
 * @param {string} data.action - The main action to be performed by the API.
 * @param {string} [data.email] - The email address associated with the request (optional).
 * @param {string} [data.subaction] - The subaction to be performed, e.g., "changename" (optional).
 * @param {string} [data.newname] - The new name to be used if the subaction is "changename" (optional).
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the Teapot API.
 */
export function postTeapotRequest(env, data) {
  const base = {
    action: data?.action,
    ...(data?.email ? { email: data.email } : {}),
    ...(data?.token ? { token: data.token } : {}),
    ...(data?.column ? { column: data.column } : {}),
    key: env.TEAPOT_API.SECRET,
  };

  let extra = {};

  if (data?.subaction === "changename") {
    extra = {
      subaction: data.subaction,
      newname: data.newname
    };
  }

  if (data?.subaction === "setoptions") {
    const { action, email, token, subaction, ...options } = data;

    extra = {
      subaction: data.subaction,
      ...options
    };
  }

  const form = new URLSearchParams({
    ...base,
    ...extra
  });

  console.log(`Teapot Request: ${form.toString().replace(`&key=${env.TEAPOT_API.SECRET}`, '')}`);

  return fetch(env.TEAPOT_API.URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
    },
    body: form
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(console.error);
}

export class TeapotBot {
  constructor(env) {
    this.env = env;
  }

  // Get the current users' linked email for Teapot Live
  async GetUser(discord_user) {
    console.log(`Fetching Teapot user for Discord ID: ${discord_user.id}`);
    
    const sql_request = this.env.database.prepare("SELECT * FROM users WHERE id = ?").bind(discord_user.id);

    const { results } = await sql_request.all();
    console.log(`Teapot User Data: ${JSON.stringify(results)}`);

    if(results[0] != undefined) return results[0];
    else return false;

  }

  // Register the current users' email for future use
  async RegisterUser(discord_user, email, settings ){
    console.log(`Registering Teapot user for Discord ID: ${discord_user.id} with email: ${email} (private: ${settings?.is_private})`);
    
    const sql_request = await this.env.database.prepare("REPLACE INTO users (id, email, timestamp, is_private) VALUES (?1, ?2, ?3, ?4)")
    .bind(discord_user.id, email, new Date().toISOString(), settings?.is_private).run();

    return sql_request;
  }

  // Update the users' profile privacy boolean
  async UpdatePrivacy(discord_user, is_private){
    console.log(`Updating privacy for Discord ID: ${discord_user.id}, private: ${is_private}`);
    
    const sql_request = this.env.database.prepare("UPDATE users SET is_private = ?1 WHERE id = ?2")
    .bind(is_private, discord_user.id).run();

    return sql_request;
  }

  // Remove the current users' records
  async UnregisterUser(discord_user){
    console.log(`Unregistering Console for Discord ID: ${discord_user.id}`);
    
    const sql_request = this.env.database.prepare("UPDATE users SET email = NULL WHERE id = ?1")
    .bind(discord_user.id).run();

    return sql_request;
  }

  // Check to see if critical services are available
  AreMonitorsOnline(){

    /* TODO - CHECK IF CRITICAL THIRD-PARTY SERVICES ARE UP:
    * Return boolean if unreachable
    */

    return true;
  }
}
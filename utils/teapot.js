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

import { BetterStack } from "./uptime";


export function postTeapotRequest(env, data) {
  const form = new URLSearchParams({
    "action": data?.action,
    ...(data?.email ? { "email": data.email } : {}),
    ...(data?.token ? { "token": data.token } : {}),
    ...(data?.subaction === "changename" ? { "subaction": data.subaction, "newname": data.newname } : {}),
    ...(data?.subaction === "setoptions"
      ? {
          subaction: data.subaction,
          [data.option.key]: data.option.value
        }
      : {}
    ),
    "key": env.TEAPOT_API.SECRET,
  });
  
  console.log(`Teapot Request: ${form.toString().replace(`&key=${env.TEAPOT_API.SECRET}`, '')}`);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
    }
  };

  options.body = form;

  const request = fetch(`${env.TEAPOT_API.URL}`, options)
    .then(response => response.json())
    .then(response => { console.log(response); return response; })
    .catch(err => console.error(err));

  return request;
}

export class TeapotBot {
  constructor(env) {
    this.env = env;
  }

  // Get the current email from kvstore for discord user
  async GetUser(discord_user) {

    console.log(`Fetching Teapot user for Discord ID: ${discord_user.id}`);
    
    const sql_request = this.env.database.prepare("SELECT * FROM users WHERE id = ?").bind(discord_user.id);

    const { results } = await sql_request.all();
    console.log(`Teapot User Data: ${JSON.stringify(results)}`);

    if(results[0] != undefined) return results[0];
    else return false;

    // also check if user has more than one console

  }

  async RegisterUser(discord_user, email, settings ){
    
    console.log(`Registering Teapot user for Discord ID: ${discord_user.id} with email: ${email} (private: ${settings?.is_private})`);
    
    const sql_request = await this.env.database.prepare("REPLACE INTO users (id, email, timestamp, is_private) VALUES (?1, ?2, ?3, ?4)")
    .bind(discord_user.id, email, new Date().toISOString(), settings?.is_private).run();

    return sql_request;

    // if(sql_request[0] != undefined) return sql_request[0];
    // else return false;

  }

  async UpdatePrivacy(discord_user, is_private){
    
    console.log(`Updating privacy for Discord ID: ${discord_user.id}, private: ${is_private}`);
    
    const sql_request = this.env.database.prepare("UPDATE users SET is_private = ?1 WHERE id = ?2")
    .bind(is_private, discord_user.id).run();

    return sql_request;

    // if(sql_request[0] != undefined) return sql_request[0];
    // else return false;

  }

  async UnregisterUser(discord_user){
    
    console.log(`Unregistering Console for Discord ID: ${discord_user.id}`);
    
    const sql_request = this.env.database.prepare("UPDATE users SET email = NULL WHERE id = ?1")
    .bind(discord_user.id).run();

    return sql_request;

    // if(sql_request[0] != undefined) return sql_request[0];
    // else return false;

  }


  /// BOOL: FailSafeModeEnabled?
  AreMonitorsOnline(){
    // BetterStack: check if teapot service is online,
    // IF NOT we return false to enable failsafe features.



    return true;

    var bs_teapot_monitor_group = "1368667";
    let _uptime_info = new BetterStack(env).GetMonitorsInGroup(bs_teapot_monitor_group);

  }
}

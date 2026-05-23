
export class BetterStack {
  constructor(env) {
    this.env = env;
  }
  
  async GetMonitorsInGroup(group_id) {
    const host_url = `https://uptime.betterstack.com/api/v2/monitor-groups/${group_id}/monitors`;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)',
        'Authorization': `Bearer ${this.env.BETTERSTACK.API_KEY}`
      }
    };

    const request = await fetch(`${host_url}`, options)
      .then(response => response.json())
      .then(response => { console.log(`[UptimeService]: Compelted GET to ${host_url}`); return response; })
      .catch(err => console.error(err));

    if (!request.ok) {
      console.error(`[UptimeService]: Failed GET to ${host_url}`);
    }

    return request;
  }
}

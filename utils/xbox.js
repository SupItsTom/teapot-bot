
export class Xbox {
  // Get's partial title information from title id
  async GetGameFromTitleID(title_id) {
    let _title_id = title_id.replace('0x', '');

    const host_url = `https://dbox.tools/api/title_ids/${_title_id.toUpperCase()}`;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
      }
    };

    const request = await fetch(`${host_url}`, options)
      .then(response => response.json())
      .then(response => { console.log(response); return response; })
      .catch(err => console.error(err));

    console.log(`Xbox:GetGameFromTitleID: ${_title_id.toUpperCase()} => ${request}`);

    if (request?.detail == "Not Found") return undefined;
    else return request;
  }

  // Get's detailed information for a marketplace product
  async GetMarketplaceProduct(product_id) {
    const host_url = `https://dbox.tools/api/marketplace/products/${product_id}`;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
      }
    };

    const request = await fetch(`${host_url}`, options)
      .then(response => response.json())
      .then(response => { console.log(response); return response; })
      .catch(err => console.error(err));

    console.log(`Xbox:GetMarketplaceProduct: ${product_id} => ${request}`);

    if (request?.detail == "Not Found") return undefined;
    else return request;
  }

  // Get's children from a parent marketplace product
  async GetMarketplaceProductAddons(product_id) {
    const host_url = `https://dbox.tools/api/marketplace/products/${product_id}/children?product_type=8`;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
      }
    };

    const request = await fetch(`${host_url}`, options)
      .then(response => response.json())
      .then(response => { console.log(response); return response; })
      .catch(err => console.error(err));

    console.log(`Xbox:GetMarketplaceProductAddons: ${product_id} => ${request}`);

    if (request?.detail == "Not Found") return undefined;
    else return request;
  }

  // Used for Command AutoComplete
  async GetGameTitleIdFromSearch(search_query) {

    let search_limit = 25
    const host_url = `https://dbox.tools/api/title_ids/?name=${search_query}&system=XBOX360&limit=${search_limit}&offset=0`;

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://supitstom.net, 1.0)'
      }
    };

    const request = await fetch(`${host_url}`, options)
      .then(response => response.json())
      .then(response => { console.log(response); return response; })
      .catch(err => console.error(err));

    return request;
  }
}

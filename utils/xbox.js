
export class Xbox {

  async GetGameFromTitleID(title_id) {

    let _title_id = title_id.replace('0x', '');

    const host_url = `https://dbox.tools/api/title_ids/${_title_id}`;


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

    console.log(`Xbox:GetGameFromTitleID: ${_title_id} => ${request}`);

    if (request?.detail == "Not Found") return undefined;
    else return request;

  }

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

    /// -----
    // console.log(`DEBUG: Dumping capabilities for product [${request.developer_name}]${request.default_title} - ${request.title_id}`);
    // request.capabilities.forEach(entry => {
    //   console.log(`--- ${entry.capability.name} ---`);
    //   console.log("Description:", entry.capability.description);
    //   console.log("Value:", entry.value);
    //   console.log("");
    // });

    /// -----

    if (request?.detail == "Not Found") return undefined;
    else return request;

  }

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

    /// -----
    // console.log(`DEBUG: Dumping capabilities for product [${request.developer_name}]${request.default_title} - ${request.title_id}`);
    // request.capabilities.forEach(entry => {
    //   console.log(`--- ${entry.capability.name} ---`);
    //   console.log("Description:", entry.capability.description);
    //   console.log("Value:", entry.value);
    //   console.log("");
    // });

    /// -----

    if (request?.detail == "Not Found") return undefined;
    else return request;

  }
}

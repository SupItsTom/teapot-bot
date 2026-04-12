import { InteractionResponseFlags, InteractionResponseType } from "discord-interactions";
import { JsonResponse } from "./client";
import { Xbox } from "./xbox";

export class AutoComplete {

    constructor(interaction) {
        this.interaction = interaction;
    }

    // GET title ids from game name search
    async StoreGetTitleIds(search_query) {
        let _product_search = await new Xbox().GetGameTitleIdFromSearch(search_query)

        return new JsonResponse({
            type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
            data: {
                choices: (_product_search.items || [])
                    .filter(item => item.name)
                    .slice(0, 25) // 25 entries max
                    .map(item => ({
                        name: item.name,
                        value: item.title_id
                    }))


            }
        });

    }


}

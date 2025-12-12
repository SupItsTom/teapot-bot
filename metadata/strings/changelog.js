import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../../utils/client";
import { MessageComponent } from "../../utils/discord";

export default [

// start of section
MessageComponent.Text(`**📌 HIGHLIGHTS**`, -1),
MessageComponent.Text(
`- Profiles should no longer time out. That's the whole patch note. 👍
- I've shipped the new Application slightly earlier than planned, [get the new bot here](https://discordapp.com/oauth2/authorize?client_id=1447678850493321288).
  - note: the previous application is discontinued and will no longer process commands.
`),

//end of section

// start of section
MessageComponent.Seperator(),

MessageComponent.Text(`**🛠 GENERAL**`, -1),
MessageComponent.Text(
`- Resolved a bug that caused </profile:1447703332700295214> to time-out before responding.
- Badges have been re-enabled for all users.
- Removed detailed game information displaying on the Profile Card.
- Added this Changelog feature!
`),

// end of section
]
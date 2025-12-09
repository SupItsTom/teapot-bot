import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { JsonResponse } from "../utils/client";
import { ClientError, MessageComponent } from "../utils/discord";
import { postTeapotRequest } from "../utils/teapot";
import { ButtonStyle } from "discord-api-types/v10";

/**
 * # Madman Text Adventure Command
 * ta_madman
 */

export class TA_MadMan {
  constructor(interaction, env, ctx) {
    this.interaction = interaction;
    this.env = env;
    this.ctx = ctx;
  }

  // -----------------------------------
  // Handle Command
  async HandleAction(taMadmanParts) {

    const [category, action] = taMadmanParts;

    switch(category){
      case "start": {

        switch(action) {
          case "new": return this.Start_NewGame();
          case "open_the_door": return this.Start_OpenTheDoor();//death
          case "take_a_torch": return this.Start_TakeATorch();//next
          case "go_through_the_hole": return this.Start_GoThroughTheHole();//retry
          case "take_a_nap": return this.Start_TakeANap();//retry
        }

      }

      case "corridor": {
        switch(action) {
          case "keep_walking": return this.Corridor_KeepWalking();//next
          case "search_for_secret_doors": return this.Corridor_SearchForSecretDoors();//retry
          case "run_back": return this.Corridor_RunBackForOtherTorch();//death
        }
      }

      case "corridor02": {
        switch(action) {
          case "keep_walking": return this.Corridor02_KeepWalking();//next
          case "draw_sword": return this.Corridor02_DrawSword();//death
          case "cast_spell": return this.Corridor02_CastSpell();//retry
        }
      }

      case "cavern": {
        switch(action) {
          case "look_at_unicorn": return this.Cavern_LookAtUnicorn();//retry
          case "pet_unicorn": return this.Cavern_PetUnicorn();//death
          case "kill_unicorn": return this.Cavern_KillUnicorn();//win
        }
      }
    }

    return false;

  }
  // -----------------------------------

  async Start_NewGameFromProfile(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**PROFILE**`, -1),
  
              MessageComponent.Text(`Hold up... A unicorn has stolen your Profile and you need to get it back!`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Get my Profile Back!!!',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Start_NewGame(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR**`, -1),
  
              MessageComponent.Text(`You awaken to find yourself on cold flagstone.\nAs you stand up you notice that the small room is lit by two torches.\nTo the north there is a door, to the south a hole in the wall.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Open the Door',
                    custom_id: 'madman:start:open_the_door',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Torch',
                    custom_id: 'madman:start:take_a_torch',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Go Through the Hole',
                    custom_id: 'madman:start:go_through_the_hole',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Nap',
                    custom_id: 'madman:start:take_a_nap',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Start_OpenTheDoor(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • OPEN THE DOOR`, -1),
  
              MessageComponent.Text(`You cautiously open the door and start to walk forward when your foot catches a loose flagstone.\nYou fall and break your neck.\nYou are dead.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Media('https://web-assets.cdn.supitstom.net/you-died.png'),
              MessageComponent.Text(`Thank you for playing!`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Danger,
                    label: 'Start Again',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Start_TakeATorch(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • TAKE A TORCH`, -1),
  
              MessageComponent.Text(`You lift the torch out of the wall sconce and open the door.\nBefore you stretches a dark corridor that fades into inky, tenebrous, blackness.\nYou walk for what feels like an eternity before you realize that your torch is beginning to burn out.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Keep Walking',
                    custom_id: 'madman:corridor:keep_walking',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Search for Secret Doors',
                    custom_id: 'madman:corridor:search_for_secret_doors',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Run back to get the other torch',
                    custom_id: 'madman:corridor:run_back',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Start_GoThroughTheHole(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • GO THROUGH THE HOLE`, -1),
  
              MessageComponent.Text(`You're not big enough to go through the hole.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What would you like to do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Open the Door',
                    custom_id: 'madman:start:open_the_door',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Torch',
                    custom_id: 'madman:start:take_a_torch',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Go Through the Hole',
                    custom_id: 'madman:start:go_through_the_hole',
                    disabled: true,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Nap',
                    custom_id: 'madman:start:take_a_nap',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Start_TakeANap(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • TAKE A NAP`, -1),
  
              MessageComponent.Text(`You awaken to find yourself on cold flagstone.\nAs you stand up you notice that the small room is lit by two torches.\nTo the north there is a door, to the south a hole in the wall.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Open the Door',
                    custom_id: 'madman:start:open_the_door',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Torch',
                    custom_id: 'madman:start:take_a_torch',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Go Through the Hole',
                    custom_id: 'madman:start:go_through_the_hole',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Take a Nap',
                    custom_id: 'madman:start:take_a_nap',
                    disabled: true,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  //

  async Corridor_KeepWalking(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • KEEP WALKING`, -1),
  
              MessageComponent.Text(`You press forward, praying to Fish Jesus™ that your torch won't go out.\nFortunately, it doesn't.\nAhead of you darkness gives way to light as a dull indigo glow illuminates the corridor up ahead.\nYou hear the sound of a large rock grinding against stone.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Keep Walking',
                    custom_id: 'madman:corridor02:keep_walking',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Draw Sword',
                    custom_id: 'madman:corridor02:draw_sword',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Cast A Spell',
                    custom_id: 'madman:corridor02:cast_spell',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Corridor_SearchForSecretDoors(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • SEARCH FOR SECRET DOORS`, -1),
  
              MessageComponent.Text(`There are no secret doors.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What would you like to do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Keep Walking',
                    custom_id: 'madman:corridor:keep_walking',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Search for Secret Doors',
                    custom_id: 'madman:corridor:search_for_secret_doors',
                    disabled: true,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Run back to get the other torch',
                    custom_id: 'madman:corridor:run_back',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Corridor_RunBackForOtherTorch(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • RUN BACK FOR THE OTHER TORCH`, -1),
  
              MessageComponent.Text(`You start to desperately run back to the main room when your foot catches a loose flagstone.\nYou fall and break your neck.\nYou are dead.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Media('https://web-assets.cdn.supitstom.net/you-died.png'),
              MessageComponent.Text(`Thank you for playing!`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Danger,
                    label: 'Start Again',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  //

  async Corridor02_KeepWalking(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • KEEP WALKING`, -1),
  
              MessageComponent.Text(`As you walk towards the indigo glow, the corridor gives way to a larger cavern.\nThe source of the light becomes apparent...\nThe room is lit by a massive luminescent lake.\nLapping at the lake is a unicorn.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What do you do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Look at the Unicorn',
                    custom_id: 'madman:cavern:look_at_unicorn',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Pet the Unicorn',
                    custom_id: 'madman:cavern:pet_unicorn',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Kill the Unicorn',
                    custom_id: 'madman:cavern:kill_unicorn',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Corridor02_CastSpell(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • CAST A SPELL`, -1),
  
              MessageComponent.Text(`You do not know magic.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What would you like to do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Keep Walking',
                    custom_id: 'madman:corridor02:keep_walking',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Draw Sword',
                    custom_id: 'madman:corridor02:draw_sword',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Cast A Spell',
                    custom_id: 'madman:corridor02:cast_spell',
                    disabled: true,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Corridor02_DrawSword(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • DRAW SWORD`, -1),
  
              MessageComponent.Text(`You sense that an evil most evil is coming down the corridor.\nAs you wait a loose flagstone falls from the ceiling.\nIt lands on your head and breaks your neck.\nYou are dead.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Media('https://web-assets.cdn.supitstom.net/you-died.png'),
              MessageComponent.Text(`Thank you for playing!`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Danger,
                    label: 'Start Again',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  //

  async Cavern_LookAtUnicorn(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • LOOK AT THE UNICORN`, -1),
  
              MessageComponent.Media('https://media.tenor.com/uObnN8lLY2IAAAAM/beautiful.gif'),
              MessageComponent.Text(`It looks like a unicorn....`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`What would you like to do?`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Look at the Unicorn',
                    custom_id: 'madman:cavern:look_at_unicorn',
                    disabled: true,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Pet the Unicorn',
                    custom_id: 'madman:cavern:pet_unicorn',
                    disabled: false,
                  },
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Kill the Unicorn',
                    custom_id: 'madman:cavern:kill_unicorn',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Cavern_PetUnicorn(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • PET THE UNICORN`, -1),
  
              MessageComponent.Text(`You run your hand through the unicorn's mane.\nThe unicorn softly whinnies and nuzzles your head in return.\nHis horn pokes you in the eye and you recoil in pain.\nAs you do so your foot catches a loose flagstone.\nYou fall and break your neck.\nYou are dead.`, 0),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Media('https://web-assets.cdn.supitstom.net/you-died.png'),
              MessageComponent.Text(`Thank you for playing!`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Danger,
                    label: 'Start Again',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  },
                ]
              },
            ]
          }
        ]
      }
    });
  }

  async Cavern_KillUnicorn(){
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
  
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            components: [
  
              MessageComponent.Text(`**TEAPOT LIVE: SURVIVAL HORROR** • KILL THE UNICORN`, -1),
  
              MessageComponent.Text(`You jump in the air and hit the dankest 360 noscope trickshot on the Unicorn.`, 0),
              MessageComponent.Media('https://web-assets.cdn.supitstom.net/victory-royale.png'),
              MessageComponent.Seperator(false, 1),
              MessageComponent.Text(`Thank you for playing!`, 0),
              MessageComponent.Seperator(true, 1),

              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  
                  {
                    type: MessageComponentTypes.BUTTON,
                    style: ButtonStyle.Secondary,
                    label: 'Play Again',
                    custom_id: 'madman:start:new',
                    disabled: false,
                  }
                ]
              },
            ]
          }
        ]
      }
    });
  }
}
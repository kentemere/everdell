/**
 * @type {Cypress.PluginConfig}
 */
import {
  AdornmentName,
  CardName,
  EventName,
  LocationName,
  ResourceType,
  RiverDestinationName,
  RiverDestinationSpotName,
} from "../../src/model/types";
import { GameJSON } from "../../src/model/jsonTypes";
import { Card } from "../../src/model/card";
import { GameState } from "../../src/model/gameState";
import { Player } from "../../src/model/player";
import { createGameFromGameState } from "../../src/model/game";
import { testInitialGameState } from "../../src/model/testHelpers";

async function getTestGameJSON(
  args: Parameters<typeof testInitialGameState>[0] = {},
  gameStateMutationFn = (gameState: GameState, player: Player) => {}
): Promise<GameJSON> {
  const gameState = testInitialGameState({
    playerNames: ["Michael", "Elynn"],
    specialEvents: [
      EventName.SPECIAL_GRADUATION_OF_SCHOLARS,
      EventName.SPECIAL_A_BRILLIANT_MARKETING_PLAN,
      EventName.SPECIAL_PERFORMER_IN_RESIDENCE,
      EventName.SPECIAL_CAPTURE_OF_THE_ACORN_THIEVES,
    ],
    forestLocations: [
      LocationName.FOREST_TWO_BERRY_ONE_CARD,
      LocationName.FOREST_TWO_WILD,
      LocationName.FOREST_DISCARD_ANY_THEN_DRAW_TWO_PER_CARD,
    ],
    meadowCards: [
      CardName.KING,
      CardName.QUEEN,
      CardName.POSTAL_PIGEON,
      CardName.INNKEEPER,
      CardName.FARM,
      CardName.HUSBAND,
      CardName.CHAPEL,
      CardName.MONK,
    ],
    ...args,
  });
  gameStateMutationFn(gameState, gameState.getActivePlayer());
  const game = await createGameFromGameState(gameState);
  return game.toJSON(true);
}

module.exports = (on: any, config: any) => {
  on("task", {
    "db:basic-game": async () => {
      return await getTestGameJSON();
    },
    "db:no-pearlbrook-game": async () => {
      return await getTestGameJSON({}, (gameState) => {
        const card = Card.fromName(CardName.MINE);
        gameState.players.forEach((player) => {
          player.cardsInHand.push(card.name);
          player.gainResources(gameState, card.baseCost);
        });
      });
    },
    "db:play-card-game": async () => {
      return await getTestGameJSON({}, (gameState) => {
        const card = Card.fromName(CardName.MINE);
        gameState.players.forEach((player) => {
          player.cardsInHand.push(card.name);
          player.gainResources(gameState, card.baseCost);
        });
      });
    },
    "db:claim-event-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        player.addToCity(gameState, CardName.MINE);
        player.addToCity(gameState, CardName.MINE);
        player.addToCity(gameState, CardName.FARM);
        player.addToCity(gameState, CardName.FARM);

        player.addToCity(gameState, CardName.WANDERER);
        player.addToCity(gameState, CardName.WANDERER);
        player.addToCity(gameState, CardName.WANDERER);
      });
    },
    "db:play-adornment-game": async () => {
      return await getTestGameJSON(
        { gameOptions: { pearlbrook: true } },
        (gameState, player) => {
          player.gainResources(gameState, { [ResourceType.PEARL]: 1 });
          player.adornmentsInHand.push(AdornmentName.BELL);
          player.adornmentsInHand.push(AdornmentName.SPYGLASS);
        }
      );
    },
    "db:select-played-adornment-game": async () => {
      return await getTestGameJSON(
        { gameOptions: { pearlbrook: true } },
        (gameState, player) => {
          player.gainResources(gameState, { [ResourceType.PEARL]: 1 });
          player.adornmentsInHand.push(AdornmentName.MIRROR);

          player.addToCity(gameState, CardName.WIFE);
          player.addToCity(gameState, CardName.WIFE);
          player.addToCity(gameState, CardName.WIFE);
          player.addToCity(gameState, CardName.WIFE);

          gameState.players[1].playedAdornments.push(AdornmentName.BELL);
          gameState.players[1].playedAdornments.push(
            AdornmentName.KEY_TO_THE_CITY
          );
        }
      );
    },
    "db:select-river-destination-game": async () => {
      return await getTestGameJSON(
        { gameOptions: { pearlbrook: true } },
        (gameState, player) => {
          player.addToCity(gameState, CardName.WANDERER);
          player.addToCity(gameState, CardName.RANGER);

          player.addToCity(gameState, CardName.FARM);
          player.addToCity(gameState, CardName.FARM);
          player.addToCity(gameState, CardName.FARM);

          player.gainResources(gameState, {
            [ResourceType.TWIG]: 5,
            [ResourceType.VP]: 5,
          });

          gameState.riverDestinationMap!.spots[
            RiverDestinationSpotName.TWO_GOVERNANCE
          ].name = RiverDestinationName.WATERMILL;
          gameState.riverDestinationMap!.spots[
            RiverDestinationSpotName.THREE_PRODUCTION
          ].name = RiverDestinationName.SNOUT_THE_EXPLORER;

          gameState.riverDestinationMap!.revealSpot(
            RiverDestinationSpotName.TWO_GOVERNANCE
          );
          gameState.riverDestinationMap!.revealSpot(
            RiverDestinationSpotName.THREE_PRODUCTION
          );

          gameState.players[1].addToCity(gameState, CardName.FERRY);
        }
      );
    },
    "db:place-ambassador-game": async () => {
      return await getTestGameJSON(
        { gameOptions: { pearlbrook: true } },
        (gameState, player) => {
          player.addToCity(gameState, CardName.WANDERER);
          player.addToCity(gameState, CardName.RANGER);

          player.addToCity(gameState, CardName.SHOPKEEPER);
          player.addToCity(gameState, CardName.JUDGE);

          player.addToCity(gameState, CardName.FARM);
          player.addToCity(gameState, CardName.FARM);
          player.addToCity(gameState, CardName.FARM);

          gameState.riverDestinationMap!.spots[
            RiverDestinationSpotName.TWO_GOVERNANCE
          ].name = RiverDestinationName.OMICRON_THE_ELDER;
          gameState.riverDestinationMap!.spots[
            RiverDestinationSpotName.TWO_TRAVELER
          ].name = RiverDestinationName.GREAT_HALL;

          gameState.riverDestinationMap!.revealSpot(
            RiverDestinationSpotName.TWO_GOVERNANCE
          );

          gameState.players[1].addToCity(gameState, CardName.FERRY);
        }
      );
    },
    "db:play-fool-game": async () => {
      return await getTestGameJSON(
        {
          numPlayers: 4,
          playerNames: ["Michael", "Elynn", "Chris", "Vanessa"],
        },
        (gameState, player) => {
          const card = Card.fromName(CardName.FOOL);
          player.gainResources(gameState, {
            [ResourceType.BERRY]: 5,
            [ResourceType.RESIN]: 5,
            [ResourceType.TWIG]: 5,
            [ResourceType.PEBBLE]: 5,
          });
          player.cardsInHand.push(card.name);
          player.cardsInHand.push(CardName.FARM, CardName.MINE);
        }
      );
    },
    "db:play-ranger-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        const card = Card.fromName(CardName.RANGER);
        player.cardsInHand.push(card.name);
        player.gainResources(gameState, card.baseCost);

        // Claim this event using the ranger.
        player.addToCity(gameState, CardName.FARM);
        player.addToCity(gameState, CardName.FARM);
        player.addToCity(gameState, CardName.FARM);
        player.addToCity(gameState, CardName.FARM);

        // Place 2 workers.
        gameState.locationsMap[LocationName.BASIC_ONE_STONE]!.push(
          player.playerId
        );
        gameState.locationsMap[LocationName.BASIC_TWO_TWIGS_AND_ONE_CARD]!.push(
          player.playerId
        );
        player.placeWorkerOnLocation(LocationName.BASIC_ONE_STONE);
        player.placeWorkerOnLocation(LocationName.BASIC_TWO_TWIGS_AND_ONE_CARD);
      });
    },
    "db:play-peddler-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        const card = Card.fromName(CardName.PEDDLER);
        player.gainResources(gameState, {
          [ResourceType.BERRY]: 5,
          [ResourceType.RESIN]: 5,
          [ResourceType.TWIG]: 5,
          [ResourceType.PEBBLE]: 5,
        });
        player.cardsInHand.push(card.name);
        player.cardsInHand.push(CardName.FARM, CardName.MINE);
      });
    },
    "db:play-bard-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        const card = Card.fromName(CardName.BARD);
        player.gainResources(gameState, {
          [ResourceType.BERRY]: 5,
          [ResourceType.RESIN]: 5,
          [ResourceType.TWIG]: 5,
          [ResourceType.PEBBLE]: 5,
        });
        player.cardsInHand.push(card.name);
        player.cardsInHand.push(
          CardName.FARM,
          CardName.MINE,
          CardName.RANGER,
          CardName.QUEEN,
          CardName.KING,
          CardName.WANDERER
        );
      });
    },
    "db:play-husband-via-farm-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        const card = Card.fromName(CardName.HUSBAND);
        player.cardsInHand.push(card.name);

        player.addToCity(gameState, CardName.GENERAL_STORE);
        player.addToCity(gameState, CardName.FARM);
      });
    },
    "db:play-miner-mole-game": async () => {
      return await getTestGameJSON({}, (gameState, player) => {
        const player2 = gameState.players[1];
        player2.addToCity(gameState, CardName.GENERAL_STORE);
        player2.addToCity(gameState, CardName.FARM);

        const card = Card.fromName(CardName.MINER_MOLE);
        player.gainResources(gameState, card.baseCost);
        player.cardsInHand.push(card.name);
      });
    },
    "db:visit-inn-game": async () => {
      return await getTestGameJSON(
        {
          meadowCards: [
            CardName.KING,
            CardName.QUEEN,
            CardName.POSTAL_PIGEON,
            CardName.POSTAL_PIGEON,
            CardName.FARM,
            CardName.HUSBAND,
            CardName.CHAPEL,
            CardName.MONK,
          ],
        },
        (gameState, player) => {
          // Visit Inn
          player.addToCity(gameState, CardName.INN);

          // To reveal after we play a card from the Meadow
          gameState.deck.addToStack(CardName.DOCTOR);
        }
      );
    },
    "db:prepare-for-season-spring-pick-one": async () => {
      return await getTestGameJSON(
        {
          meadowCards: [
            CardName.MINE,
            CardName.MINE,
            CardName.QUEEN,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
          ],
        },
        (gameState, player) => {
          player.nextSeason();

          gameState.locationsMap[LocationName.BASIC_ONE_BERRY]!.push(
            player.playerId,
            player.playerId,
            player.playerId
          );

          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);
          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);
          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);

          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);

          gameState.deck.addToStack(CardName.KING);
        }
      );
    },

    "db:prepare-for-season-spring-full-hand": async () => {
      return await getTestGameJSON(
        {
          meadowCards: [
            CardName.MINE,
            CardName.MINE,
            CardName.QUEEN,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
            CardName.MINE,
          ],
        },
        (gameState, player) => {
          player.nextSeason();

          gameState.locationsMap[LocationName.BASIC_ONE_BERRY]!.push(
            player.playerId,
            player.playerId,
            player.playerId
          );

          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);
          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);
          player.placeWorkerOnLocation(LocationName.BASIC_ONE_BERRY);

          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);
          player.addCardToHand(gameState, CardName.FARM);

          gameState.deck.addToStack(CardName.KING);
        }
      );
    },
  });
};

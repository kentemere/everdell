import * as React from "react";
import styles from "../styles/gameBoard.module.css";
import {
  CardName,
  EventName,
  LocationName,
  LocationType,
  EventType,
} from "../model/types";
import { Player } from "../model/player";
import { GameState } from "../model/gameState";
import { GameStateJSON } from "../model/jsonTypes";
import { Event as EventModel, oldEventEnums } from "../model/event";
import { Location as LocationModel } from "../model/location";

import GameLog from "./GameLog";
import Card, { PlayedCard } from "./Card";
import Location from "./Location";
import { RiverDestinationSpot } from "./RiverDestination";
import Adornment from "./Adornment";
import Event from "./Event";
import { GameBlock, ItemWrapper } from "./common";

export const Meadow: React.FC<{ meadowCards: CardName[] }> = ({
  meadowCards,
}) => {
  return (
    <GameBlock title={"Meadow"}>
      <div id={"js-meadow-cards"}>
        <div className={styles.items_no_wrap}>
          {meadowCards.slice(0, 4).map((cardName, idx) => (
            <ItemWrapper key={idx}>
              <Card name={cardName} />
            </ItemWrapper>
          ))}
        </div>
        <div className={styles.items_no_wrap}>
          {meadowCards.slice(4).map((cardName, idx) => (
            <ItemWrapper key={idx}>
              <Card name={cardName} />
            </ItemWrapper>
          ))}
        </div>
      </div>
    </GameBlock>
  );
};

export const LocationsAndEvents: React.FC<{
  gameState: GameState;
  viewingPlayer: Player | null;
}> = ({ gameState, viewingPlayer }) => {
  return (
    <div className={styles.locations_and_events}>
      <Locations gameState={gameState} viewingPlayer={viewingPlayer} />
      <Events gameState={gameState} />
    </div>
  );
};

export const Locations: React.FC<{
  gameState: GameState;
  viewingPlayer: Player | null;
}> = ({ gameState, viewingPlayer }) => {
  const locationsMap = gameState.locationsMap;
  const allLocations = Object.keys(locationsMap) as LocationName[];
  const allLocationObjs = allLocations.map((x) => LocationModel.fromName(x));

  const sortOrder: Record<LocationType, number> = {
    [LocationType.FOREST]: 1,
    [LocationType.BASIC]: 2,
    [LocationType.HAVEN]: 3,
    [LocationType.JOURNEY]: 4,
  };

  allLocationObjs.sort((a, b) => {
    return sortOrder[a.type] - sortOrder[b.type];
  });

  const renderLocationWithPlayerNames = (name: LocationName) => {
    return (
      <Location
        key={name}
        name={name}
        gameState={gameState}
        viewingPlayer={viewingPlayer}
        playerWorkers={(locationsMap[name] || []).map(
          (pId) => gameState.getPlayer(pId).name
        )}
      />
    );
  };

  return (
    <GameBlock title={"Locations"}>
      <div className={styles.location_items}>
        {allLocationObjs.map((location, idx) => {
          return renderLocationWithPlayerNames(location.name);
        })}
      </div>
    </GameBlock>
  );
};

export const ForestLocations: React.FC<{
  gameState: GameState;
  viewingPlayer: Player | null;
}> = ({ gameState, viewingPlayer }) => {
  const locationsMap = gameState.locationsMap;
  const allLocations = Object.keys(locationsMap) as LocationName[];
  const allLocationObjs = allLocations.map((x) => LocationModel.fromName(x));
  const allForestLocationObjs = allLocationObjs.filter(
    (x) => x.type === LocationType.FOREST
  );
  const renderLocationWithPlayerNames = (name: LocationName) => {
    return (
      <Location
        key={name}
        name={name}
        gameState={gameState}
        viewingPlayer={viewingPlayer}
        playerWorkers={(locationsMap[name] || []).map(
          (pId) => gameState.getPlayer(pId).name
        )}
      />
    );
  };

  return (
    <GameBlock title={"Forest Locations"}>
      <div className={styles.forest_locations}>
        {allForestLocationObjs.map((location, idx) => {
          return renderLocationWithPlayerNames(location.name);
        })}
      </div>
    </GameBlock>
  );
};

export const Events: React.FC<{
  gameState: GameState;
  numColumns?: number;
}> = ({ gameState, numColumns = 3 }) => {
  const renderClaimedEvent = (name: EventName) => {
    // See comment above oldEventEnums
    const oldEventName = Object.keys(gameState.eventsMap).find(
      (oldEventName) => {
        if (oldEventEnums[oldEventName]) {
          const oldName = oldEventEnums[oldEventName];
          return EventName[oldName as keyof typeof EventName] === name;
        }
      }
    );

    const playerId =
      gameState.eventsMap[name] ||
      (oldEventName && gameState.eventsMap[oldEventName as EventName]);
    const claimedBy = playerId ? gameState.getPlayer(playerId).name : null;
    return (
      <div key={name} className={styles.event_item}>
        <Event name={name} claimedBy={claimedBy} />
      </div>
    );
  };
  const allEvents = Object.keys(gameState.eventsMap) as EventName[];
  const allEventObj = allEvents.map((eventName) =>
    EventModel.fromName(eventName)
  );

  allEventObj.sort((a, b) => {
    return (
      (a.type === EventType.BASIC ? -1 : 1) -
      (b.type === EventType.BASIC ? -1 : 1)
    );
  });

  const columns: EventModel[][] = [];
  allEventObj.forEach((event, idx) => {
    const colIdx = idx % numColumns;
    columns[colIdx] = columns[colIdx] || [];
    columns[colIdx]!.push(event);
  });

  return (
    <GameBlock
      title={gameState.gameOptions.pearlbrook ? "Events & Wonders" : "Events"}
    >
      <div id={"js-game-events"} className={styles.event_items}>
        {columns.map((events, idx) => {
          return (
            <div key={idx} className={styles.event_items_col}>
              {events.map((event) => renderClaimedEvent(event.name))}
            </div>
          );
        })}
      </div>
    </GameBlock>
  );
};

export const PlayerCity: React.FC<{
  player: Player;
  viewerId: string | null;
}> = ({ player, viewerId }) => {
  const playedCards = player.getAllPlayedCards();
  const playedAdornments = player.playedAdornments;

  const labelToCount: [string, number][] = [
    ["Critters", player.getNumPlayedCritters()],
    ["Constructions", player.getNumPlayedConstructions()],
    ["Common Critters", player.getNumPlayedCommonCritters()],
    ["Common Constructions", player.getNumPlayedCommonConstructions()],
    ["Unique Critters", player.getNumPlayedUniqueCritters()],
    ["Unique Constructions", player.getNumPlayedUniqueConstructions()],
  ];

  return playedCards.length !== 0 || playedAdornments.length !== 0 ? (
    <div data-cy={`player-city:${player.name}`}>
      <div className={styles.city_stats}>
        {labelToCount
          .filter(([_, count]) => count)
          .map(([label, count], idx) => {
            return (
              <React.Fragment key={label}>
                {idx !== 0 && "/"}
                <div className={styles.city_stat}>
                  <span>{label}: </span>
                  <span>{count}</span>
                </div>
              </React.Fragment>
            );
          })}
      </div>
      <div className={styles.items}>
        {playedCards.map((playedCard, idx) => (
          <ItemWrapper key={`card-${idx}`}>
            <PlayedCard
              playedCard={playedCard}
              viewerId={viewerId}
              cardOwner={player}
            />
          </ItemWrapper>
        ))}
        {playedAdornments.map((playedAdornment, idx) => (
          <Adornment key={`adornment-${idx}`} name={playedAdornment} />
        ))}
      </div>
    </div>
  ) : (
    <div data-cy={`player-city:${player.name}`} className={styles.empty_city}>
      City is empty.
    </div>
  );
};

export const GameBoard: React.FC<{
  gameState: GameState;
  gameStateJSON: GameStateJSON;
  viewingPlayer: Player | null;
}> = ({ gameState, gameStateJSON, viewingPlayer }) => {
  return (
    <div className={styles.game_board}>
      <div>
        <div className={styles.game_board_meadow}>
          <Meadow meadowCards={gameState.meadowCards} />
        </div>
        <GameLog logs={gameState.gameLog} gameStateJSON={gameStateJSON} />
      </div>
      <div>
        <ForestLocations gameState={gameState} viewingPlayer={viewingPlayer} />
      </div>
      <div className={styles.game_board_events}>
        <Events gameState={gameState} numColumns={2} />
      </div>
    </div>
  );
};

export const River: React.FC<{
  gameState: GameState;
  viewingPlayer: Player | null;
}> = ({ gameState, viewingPlayer }) => {
  return (
    <GameBlock title={"River"}>
      <div id={"js-game-river"} className={styles.river_items}>
        {gameState
          .riverDestinationMap!.spotEntries()
          .map(([spotName, spotInfo], idx) => {
            return (
              <RiverDestinationSpot
                key={idx}
                name={spotName}
                destination={spotInfo.name}
                ambassadors={spotInfo.ambassadors.map(
                  (playerId) => gameState.getPlayer(playerId).name
                )}
              />
            );
          })}
      </div>
    </GameBlock>
  );
};

import {
  Card,
  CardCombination,
  Game,
  Player,
  Round,
  Turn,
  areCardCombinationsEqual,
  canPutDownCardCombination,
  cardRanks,
  cardSuits,
  getPassedPlayerIndexes,
  isFirstGame,
  removeCards,
  suffleArray,
  parseCardsToCardCombinations,
  areCardsEqual,
} from './utils'

export * as utils from './utils'


//
// Reducers
//

export const appendPlayer = (game: Game, player: Player): Game => {
  if (game.players.some((e) => e.id === player.id)) {
    throw new Error('`player.id` is duplicated.')
  }
  return {
    ...game,
    players: [
      ...game.players,
      player,
    ],
  }
}

export const clearHands = (game: Game): Game => {
  return {
    ...game,
    players: game.players.map(player => {
      return {
        ...player,
        hand: [],
      }
    }),
  }
}

/**
 * @todo Joker を生成できるようにする。
 */
export const resetStock = (game: Game): Game => {
  const stock: Card[] = []
  for (const cardSuit of cardSuits) {
    for (const cardRank of cardRanks) {
      stock.push({
        isJoker: false,
        suit: cardSuit,
        rank: cardRank,
      })
    }
  }
  return {
    ...game,
    stock: suffleArray<Card>(stock, game.settings.getRandom),
  }
}

export const desideDealerAndFirstPlayer = (game: Game): Game => {
  let nextDealerIndex
  // The first game.
  if (isFirstGame(game.players)) {
    // TODO: 仮決め中。デフォルト設定はダイヤの3持ちからにするが、そのためにはダイヤの3からゲームを始める処理が必要。
    // TODO: その他の決め方も多くのローカルルールがあるよう。ランダムはあっても良さそう。
    nextDealerIndex = 0
  // From the second game.
  } else {
    nextDealerIndex = game.players.findIndex(e => e.grade === 1)
    if (nextDealerIndex === -1) {
      throw new Error('There are no players with grade 1.')
    }
  }
  return {
    ...game,
    dealerIndex: nextDealerIndex,
    playerIndexOnTurn: nextDealerIndex,
  }
}

/**
 * Deal cards from the current dealerIndex to each player until the stock runs out.
 */
export const dealCards = (game: Game): Game => {
  const stock = game.stock.slice()
  const newPlayers: Player[] = game.players.map((e) => {return {...e}})
  const dealerIndex = game.dealerIndex
  if (dealerIndex === undefined) {
    throw new Error('`dealerIndex` has not been decided.')
  }
  let playerIndexDealtCard: number = dealerIndex
  while (stock.length > 0) {
    playerIndexDealtCard = (playerIndexDealtCard + 1) % newPlayers.length
    let targetPlayer = newPlayers[playerIndexDealtCard]
    const dealtCard = stock.shift()
    if (dealtCard === undefined) {
      throw new Error('`dealtCard` is undefined.')
    }
    newPlayers[playerIndexDealtCard] = {
      ...targetPlayer,
      hand: [
        ...targetPlayer.hand,
        dealtCard,
      ],
    }
  }
  return {
    ...game,
    players: newPlayers,
    stock: [],
  }
}

/**
 * @todo Joker による穴埋めが一意に決まらないときに、何に擬態するかを決定する必要がある。
 */
export const proceedTurn = (game: Game, cardCombination: CardCombination | undefined): Game => {
  const playerIndexOnTurn = game.playerIndexOnTurn
  if (playerIndexOnTurn === undefined) {
    throw new Error('"playerIndexOnTurn" is undefined.')
  }

  const playerOnTurn = game.players[playerIndexOnTurn]
  const inGamePlayerIndexes = game.players.reduce<number[]>((acc, player, index) => {
    return player.ranking > 0 ? acc : [...acc, index]
  }, [])
  const passedPlayerIndexes = getPassedPlayerIndexes(game.rounds[game.rounds.length - 1])
  const alivedPlayerIndexes = game.players
    .map((e_, i) => i)
    .filter((playerIndex) => {
      return inGamePlayerIndexes.indexOf(playerIndex) !== -1 &&
        passedPlayerIndexes.indexOf(playerIndex) === -1
    })
  let newPlayers: Player[] = game.players.slice()
  let newRounds: Round[] = game.rounds.slice()

  // Does the current player have that card combination?
  const selectableCardCombinations: CardCombination[] = parseCardsToCardCombinations(playerOnTurn.hand)
  if (cardCombination !== undefined) {
    if (!selectableCardCombinations.some(e => areCardCombinationsEqual(e, cardCombination))) {
      throw new Error('The current player does not have the card combination.')
    }
  }

  // Get layouted card combination.
  const lastSubmittedTurn: Turn | undefined = newRounds[newRounds.length - 1].turns
    .slice()
    .reverse()
    .find(e => e.cardCombination)
  const layoutedCardCombination: CardCombination | undefined =
    lastSubmittedTurn ? lastSubmittedTurn.cardCombination : undefined

  // Proceed the turn.
  let newLayoutedCardCombination: CardCombination | undefined = undefined 
  if (cardCombination !== undefined) {
    if (layoutedCardCombination && !canPutDownCardCombination(cardCombination, layoutedCardCombination)) {
      throw new Error('It is not a card combination that can be put down.')
    }
    // Put down the pulled out card combination.
    newLayoutedCardCombination = cardCombination
  }
  newRounds[newRounds.length - 1] = {
    ...newRounds[newRounds.length - 1],
    turns: [
      ...newRounds[newRounds.length - 1].turns,
      {
        cardCombination: newLayoutedCardCombination,
        playerIndex: playerIndexOnTurn,
      },
    ],
  }

  // Set the turn to the appropriate player and proceed to the next round if necessary.
  let newPlayerIndexOnTurn: number
  // Did one of the last two pass?
  const lastRound = newRounds[newRounds.length - 1]
  if (
    alivedPlayerIndexes.length === 2 &&
    lastRound.turns[lastRound.turns.length - 1].cardCombination === undefined
  ) {
    // Proceed to the next round.
    newRounds = [
      ...newRounds,
      {
        turns: [],
      },
    ]
    // Change the turn to the player who put down cards last.
    newPlayerIndexOnTurn = alivedPlayerIndexes[0] === playerIndexOnTurn ?
      alivedPlayerIndexes[1] : alivedPlayerIndexes[0]
  } else {
    // Change the turn to the next player.
    newPlayerIndexOnTurn =
      alivedPlayerIndexes[(alivedPlayerIndexes.indexOf(playerIndexOnTurn) + 1) % alivedPlayerIndexes.length]
  }

  // Reduce the player's hand.
  if (cardCombination !== undefined) {
    let newPlayer = newPlayers[playerIndexOnTurn]
    newPlayer = {
      ...newPlayer,
      hand: removeCards(newPlayer.hand, cardCombination.cards),
    }
    // If it reaches 0, the player is out of the game.
    const maxRanking = Math.max(...newPlayers.map(e => e.ranking))
    if (newPlayer.hand.length === 0) {
      newPlayer = {
        ...newPlayer,
        ranking: maxRanking + 1,
      }
    }
    newPlayers[playerIndexOnTurn] = newPlayer
    // If there is only one player left, the game ends.
    if (newPlayers.filter(e => e.ranking === 0).length === 1) {
      const lastPlayerIndex = newPlayers.findIndex(e => e.ranking === 0)
      if (lastPlayerIndex === undefined) {
        throw new Error('It should not pass here.')
      }
      newPlayers[lastPlayerIndex] = {
        ...newPlayers[lastPlayerIndex],
        ranking: maxRanking + 2,
      }
    }
  }

  return {
    ...game,
    rounds: newRounds,
    players: newPlayers,
    playerIndexOnTurn: newPlayerIndexOnTurn,
  }
}

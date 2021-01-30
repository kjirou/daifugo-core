//
// Utilities without any context
//

/**
 * Shuffle an array with the Fisher–Yates algorithm.
 *
 * Ref) https://www.30secondsofcode.org/js/s/shuffle/
 */
export const suffleArray = <Element> (array: Element[], getRandom: () => number): Element[] => {
  const copied = array.slice()
  let m = copied.length
  while (m) {
    const i = Math.floor(getRandom() * m)
    m--
    [copied[m], copied[i]] = [copied[i], copied[m]]
  }
  return copied
}

/**
 * @example
 *   (0) => [[0]]
 *   (1) => [[0], [1], [0, 1]]
 *   (2) => [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]]
 * @todo Memoize results.
 */
export const expandIndexCombinations = (maxIndex: number): number[][] => {
  const explore = (baseIndex: number, maxIndex_: number): number[][] => {
    const paths: number[][] = []
    for (let i: number = baseIndex; i <= maxIndex_; i++) {
      paths.push([i])
      explore(i + 1, maxIndex_).forEach(path => {
        paths.push([i, ...path])
      })
    }
    return paths
  }
  return explore(0, maxIndex).sort((a, b) => a.length - b.length)
}


//
// Types
//

type CardSuit = 'spade' | 'club' | 'diamond' | 'heart'

type CardRank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13'

export type NotJokerCard = Readonly<{
  isJoker: false,
  rank: CardRank,
  suit: CardSuit,
}>

type JokerCard = Readonly<{
  isJoker: true,
}>

export type Card = NotJokerCard | JokerCard

export type CardCombination = Readonly<{
  /** The default sort(= 1st: compareCardRankSortOrder, 2nd: compareCardSuitSortOrder) has been applied. */
  cards: Card[],
  // TODO: Wikipedia から、同時出しのルールを抜粋。
  //       > 同数複数枚出し（2～6枚まで可。ジョーカーを用いても良い。子は6枚組に対しては出せない。）
  //       > 階段出し｛3～14枚まで可。子は場札の最小の数字よりも、手札の最小の数字の方が上回っていれば出すことができる
  //         （例:場の345には手札から456を出せる）。尚、3枚組での最大の数字は、A2+ジョーカーである。｝
  //       > ジョーカーを含む出し方を行う時は、そのジョーカーに割り当てたい数字を選ぶ。
  //         階段出しを行う時や、スート縛りが発生している時であれば更にスートも選ぶ。
  //       ジョーカーは、他のカードの代用としての振る舞いと、独自の振る舞いを持つよう。
  category: 'single' | 'multiple' | 'sequence',
}>

/** `5` means "millonaire". */
type Grade = 5 | 4 | 3 | 2 | 1

export type Player = Readonly<{
  /**
   * A grade in the current game.
   * 
   * In the first game, all players are undefined.
   * From the second game onwards, all players have a value. Those values always contain 5 and 1. 
   */
  grade: Grade | undefined,
  hand: Card[],
  /** An identifier passed from the outside. */
  id: string,
  /** `1` is the best ranking. `0` means undecided. */
  ranking: number,
}>

export type Turn = Readonly<{
  /** `undefined` means that the player has made a pass. */
  cardCombination: CardCombination | undefined,
  playerIndex: number,
}>

export type Round = Readonly<{
  turns: Turn[],
}>

export type Game = Readonly<{
  /** An index for "players" property. */
  dealerIndex: number | undefined,
  playerIndexOnTurn: number | undefined,
  /** The order of the array is used as the order of the player turn. */
  players: Player[],
  rounds: Round[],
  settings: {
    getRandom: () => number,
  },
  stock: Card[],
}>


//
// Constants and Functions
//

export const cardSuits: readonly CardSuit[] = ['spade', 'club', 'diamond', 'heart'] as const

/** The element order of the array is used as the strength of the card. */
export const cardRanks: readonly CardRank[] =
  ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '1', '2'] as const

export const isJokerCardType = (card: Card): card is JokerCard => card.isJoker

export const isFirstGame = (players: Player[]): boolean => players.every(e => e.grade === undefined)

/**
 * Sort order the cards in ascending order of suit.
 */
export const compareCardSuitSortOrder = (a: Card, b: Card): number => {
  if (isJokerCardType(a) && isJokerCardType(b)) {
    return 0
  } else if (isJokerCardType(a)) {
    return -1
  } else if (isJokerCardType(b)) {
    return 1
  }
  const aIndex = cardSuits.indexOf(a.suit)
  const bIndex = cardSuits.indexOf(b.suit)
  if (aIndex < bIndex) {
    return -1
  } else if (bIndex < aIndex) {
    return 1
  }
  return 0
}

/**
 * Sort order the cards in ascending order of rank.
 * 
 * It is also used when comparing the strength of cards.
 */
export const compareCardRankSortOrder = (a: Card, b: Card): number => {
  if (isJokerCardType(a) && isJokerCardType(b)) {
    return 0
  } else if (isJokerCardType(a)) {
    return 1
  } else if (isJokerCardType(b)) {
    return -1
  }
  const aIndex = cardRanks.indexOf(a.rank)
  const bIndex = cardRanks.indexOf(b.rank)
  if (aIndex < bIndex) {
    return -1
  } else if (bIndex < aIndex) {
    return 1
  }
  return 0
}

export const isCardRankStrongerThan = (subject: Card, target: Card): boolean => {
  return compareCardRankSortOrder(subject, target) === 1
}

export const areCardsEqual = (a: Card, b: Card): boolean => {
  if (isJokerCardType(a)) {
    return isJokerCardType(b)
  } else if (isJokerCardType(b)) {
    return false
  }
  return a.suit === b.suit && a.rank === b.rank
}

export const areCardCombinationsEqual = (a: CardCombination, b: CardCombination): boolean => {
  if (a.category !== b.category || a.cards.length !== b.cards.length) {
    return false
  }
  const aCards = a.cards.slice().sort(compareCardSuitSortOrder).sort(compareCardRankSortOrder)
  const bCards = b.cards.slice().sort(compareCardSuitSortOrder).sort(compareCardRankSortOrder)
  for (let i = 0; i < aCards.length; i++) {
    if (!areCardsEqual(aCards[i], bCards[i])) {
      return false
    }
  }
  return true
}

export const getPassedPlayerIndexes = (round: Round): number[] => {
  return round.turns.reduce((memo: number[], turn) => {
    return turn.cardCombination === undefined ? [...memo, turn.playerIndex] : memo
  }, [])
}

export const isRoundFinished = (round: Round, players: Player[]): boolean => {
  return players.length - 1 === getPassedPlayerIndexes(round).length
}

/**
 * @todo Joker の考慮をする。また、複数枚存在するときには、候補上は一つにする。
 * @returns The sort order is indefinite.
 */
export const parseCardsToSingleCardCombinations = (sortedCards: readonly NotJokerCard[]): CardCombination[] => {
  const combinations: CardCombination[] = []
  for (const card of sortedCards) {
    combinations.push({
      category: 'single',
      cards: [card],
    })
  }
  return combinations
}

/**
 * @todo Joker による同ランクの穴埋め。
 * @returns The sort order is indefinite.
 */
export const parseCardsToMultipleCardCombinations = (cards: readonly NotJokerCard[]): CardCombination[] => {
  const sortedCards = cards.slice().sort(compareCardSuitSortOrder).sort(compareCardRankSortOrder)
  const combinations: CardCombination[] = []
  const uniqueCardRanks = sortedCards.reduce((memo: CardRank[], card) => {
    if (memo.indexOf(card.rank) === -1) {
      memo.push(card.rank)
    }
    return memo
  }, [])
  for (const cardRank of uniqueCardRanks) {
    const sameRankCards: Card[] = sortedCards.filter(e => e.rank === cardRank)
    expandIndexCombinations(sameRankCards.length - 1)
      .filter(e => e.length >= 2)
      .forEach(cardIndexCombination => {
        combinations.push({
          category: 'multiple',
          cards: cardIndexCombination.map(cardIndex => sameRankCards[cardIndex])
        })
      })
  }
  return combinations
}

/**
 * @todo Joker による連番の穴埋め。
 * @todo おそらくは処理が重い。特にループ数やindexOfの呼び出しが多い。
 * @returns The sort order is indefinite.
 */
export const parseCardsToSequenceCardCombinations = (cards: readonly NotJokerCard[]): CardCombination[] => {
  const sortedCards = cards.slice().sort(compareCardSuitSortOrder).sort(compareCardRankSortOrder)
  const combinations: CardCombination[] = []
  const cardsGroupedBySuitList: {
    suit: CardSuit,
    cards: NotJokerCard[],
  }[] = cardSuits.map(cardSuit => {
    return {
      suit: cardSuit,
      cards: sortedCards
        .filter(e => e.suit === cardSuit)
        .map(card => {
          if (isJokerCardType(card)) {
            throw new Error('This `card` will not be a joker.')
          }
          return card
        }),
    }
  })
  for (const cardsGroupedBySuit of cardsGroupedBySuitList) {
    const cardRankIndexes: number[] = cardsGroupedBySuit.cards.map(e => cardRanks.indexOf(e.rank))
    const sequenceCandidates: {
      fromCardRankIndex: number,
      toCardRankIndex: number,
      missingCardRankIndexes: number[],
    }[] = []
    for (let fromCardRankIndex = 0; fromCardRankIndex < cardRanks.length; fromCardRankIndex++) {
      // TODO: "1","2","Joker" の連番を考慮する。
      for (let toCardRankIndex = fromCardRankIndex + 2; toCardRankIndex < cardRanks.length; toCardRankIndex++) {
        const missingCardRankIndexes = []
        for (let targetCardRankIndex = fromCardRankIndex; targetCardRankIndex <= toCardRankIndex; targetCardRankIndex++) {
          if (cardRankIndexes.indexOf(targetCardRankIndex) === -1) {
            missingCardRankIndexes.push(targetCardRankIndex)
          }
        }
        sequenceCandidates.push({
          fromCardRankIndex,
          toCardRankIndex,
          missingCardRankIndexes,
        })
      }
    }
    for (const sequenceCandidate of sequenceCandidates) {
      // TODO: Joker による穴埋めを考慮をする。
      if (sequenceCandidate.missingCardRankIndexes.length > 0) {
        continue
      }
      const sequenceCards: NotJokerCard[] = []
      for (let i = sequenceCandidate.fromCardRankIndex; i <= sequenceCandidate.toCardRankIndex; i++) {
        const cardRank = cardRanks[i]
        sequenceCards.push(cardsGroupedBySuit.cards.find(e => e.rank === cardRank) as NotJokerCard)
      }
      combinations.push({
        category: 'sequence',
        cards: sequenceCards.sort(compareCardSuitSortOrder).sort(compareCardSuitSortOrder),
      })
    }
  }
  return combinations
}

export const parseCardsToCardCombinations = (
  cards: Card[],
  options: {
    categories: CardCombination['category'][],
  } = {
    categories: ['single', 'multiple', 'sequence'],
  },
): CardCombination[] => {
  const combinations: CardCombination[] = []
  const sortedNotJokerCards: NotJokerCard[] = cards.slice()
    .filter(e => !isJokerCardType(e)).map(e => e as NotJokerCard)
  if (options.categories.indexOf('single') !== -1) {
    for (const e of parseCardsToSingleCardCombinations(sortedNotJokerCards)) {
      combinations.push(e)
    }
  }
  if (options.categories.indexOf('multiple') !== -1) {
    for (const e of parseCardsToMultipleCardCombinations(sortedNotJokerCards)) {
      combinations.push(e)
    }
  }
  if (options.categories.indexOf('sequence') !== -1) {
    for (const e of parseCardsToSequenceCardCombinations(sortedNotJokerCards)) {
      combinations.push(e)
    }
  }
  return combinations
}

/**
 * @todo Joker が擬態しているときに、multiple と sequence の rank の強弱判定が機能しない。
 */
export const canPutDownCardCombination = (pulledOut: CardCombination, layouted: CardCombination): boolean => {
  switch (layouted.category) {
    case 'single': {
      return pulledOut.category === 'single' &&
        isCardRankStrongerThan(pulledOut.cards[0], layouted.cards[0])
    }
    case 'multiple': {
      return pulledOut.category === 'multiple' &&
        pulledOut.cards.length === layouted.cards.length &&
        isCardRankStrongerThan(pulledOut.cards[0], layouted.cards[0])
    }
    case 'sequence': {
      return pulledOut.category === 'sequence' &&
        pulledOut.cards.length === layouted.cards.length &&
        isCardRankStrongerThan(pulledOut.cards[0], layouted.cards[0])
    }
  }
}

export const removeCards = (cards: readonly Card[], removedCards: readonly Card[]): Card[] => {
  const newCards: Card[] = cards.slice()
  for (const removedCard of removedCards) {
    const index = newCards.findIndex(e => areCardsEqual(e, removedCard))
    if (index === -1) {
      throw new Error('A non-existent card was passed.')
    }
    newCards.splice(index, 1)
  }
  return newCards
}

export const createPlayer = (): Player => {
  return {
    grade: undefined,
    hand: [],
    id: '',
    ranking: 0,
  }
}

export const createGame = (): Game => {
  return {
    dealerIndex: undefined,
    playerIndexOnTurn: undefined,
    players: [],
    rounds: [
      {
        turns: [],
      },
    ],
    settings: {
      getRandom: () => Math.random(),
    },
    stock: [],
  }
}

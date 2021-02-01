import {
  appendPlayer,
} from '..'
import {
  Card,
  CardCombination,
  NotJokerCard,
  areCardCombinationsEqual,
  areCardsEqual,
  canPutDownCardCombination,
  compareCardRankSortOrder,
  compareCardSuitSortOrder,
  createGame,
  createPlayer,
  expandIndexCombinations,
  isCardRankStrongerThan,
  isGameFinished,
  isJokerCardType,
  parseCardsToCardCombinations,
  parseCardsToMultipleCardCombinations,
  parseCardsToSequenceCardCombinations,
  parseCardsToSingleCardCombinations,
  removeCards,
} from '../utils'

const strinfigyCard = (card: Card): string => isJokerCardType(card) ? 'Joker' : `${card.suit}-${card.rank}`

describe('src/utils', () => {
  describe('expandIndexCombinations', () => {
    const testCases: {
      maxIndex: number,
      expected: number[][],
    }[] = [
      {
        maxIndex: 0,
        expected: [[0]],
      },
      {
        maxIndex: 1,
        expected: [[0], [1], [0, 1]],
      },
      {
        maxIndex: 2,
        expected: [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]],
      },
      {
        maxIndex: 3,
        expected: [
          [0], [1], [2], [3],
          [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
          [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3],
          [0, 1, 2, 3],
        ],
      },
    ]
    for (const testCase of testCases) {
      it(`${testCase.maxIndex} => ${JSON.stringify(testCase.expected)}`, () => {
        expect(expandIndexCombinations(testCase.maxIndex)).toEqual(testCase.expected)
      })
    }
  })
  describe('compareCardSuitSortOrder', () => {
    const testCases: {
      a: Card,
      b: Card,
      expected: -1 | 0 | 1,
    }[] = [
      {
        a: {isJoker: false, suit: 'spade', rank: '1'},
        b: {isJoker: false, suit: 'club', rank: '1'},
        expected: -1,
      },
      {
        a: {isJoker: false, suit: 'club', rank: '1'},
        b: {isJoker: false, suit: 'spade', rank: '1'},
        expected: 1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '1'},
        b: {isJoker: false, suit: 'spade', rank: '1'},
        expected: 0,
      },
      {
        a: {isJoker: false, suit: 'diamond', rank: '1'},
        b: {isJoker: false, suit: 'heart', rank: '1'},
        expected: -1,
      },
      {
        a: {isJoker: false, suit: 'heart', rank: '1'},
        b: {isJoker: false, suit: 'diamond', rank: '1'},
        expected: 1,
      },
      {
        a: {isJoker: true},
        b: {isJoker: false, suit: 'spade', rank: '1'},
        expected: -1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '1'},
        b: {isJoker: true},
        expected: 1,
      },
      {
        a: {isJoker: true},
        b: {isJoker: true},
        expected: 0,
      },
    ]
    for (const testCase of testCases) {
      it(`${strinfigyCard(testCase.a)} <> ${strinfigyCard(testCase.b)} => ${testCase.expected}`, () => {
        expect(compareCardSuitSortOrder(testCase.a, testCase.b)).toBe(testCase.expected)
      })
    }
  })
  describe('compareCardRankSortOrder', () => {
    const testCases: {
      a: Card,
      b: Card,
      expected: -1 | 0 | 1,
    }[] = [
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: false, suit: 'spade', rank: '4'},
        expected: -1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '4'},
        b: {isJoker: false, suit: 'spade', rank: '3'},
        expected: 1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: false, suit: 'spade', rank: '3'},
        expected: 0,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '13'},
        b: {isJoker: false, suit: 'spade', rank: '1'},
        expected: -1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '1'},
        b: {isJoker: false, suit: 'spade', rank: '13'},
        expected: 1,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '2'},
        b: {isJoker: true},
        expected: -1,
      },
      {
        a: {isJoker: true},
        b: {isJoker: false, suit: 'spade', rank: '2'},
        expected: 1,
      },
      {
        a: {isJoker: true},
        b: {isJoker: true},
        expected: 0,
      },
    ]
    for (const testCase of testCases) {
      it(`${strinfigyCard(testCase.a)} <> ${strinfigyCard(testCase.b)} => ${testCase.expected}`, () => {
        expect(compareCardRankSortOrder(testCase.a, testCase.b)).toBe(testCase.expected)
      })
    }
  })
  describe('isCardRankStrongerThan', () => {
    const testCases: {
      subject: Card,
      target: Card,
      expected: boolean,
    }[] = [
      {
        subject: {isJoker: false, suit: 'spade', rank: '4'},
        target: {isJoker: false, suit: 'spade', rank: '3'},
        expected: true,
      },
      {
        subject: {isJoker: false, suit: 'spade', rank: '3'},
        target: {isJoker: false, suit: 'spade', rank: '3'},
        expected: false,
      },
      {
        subject: {isJoker: false, suit: 'spade', rank: '3'},
        target: {isJoker: false, suit: 'spade', rank: '4'},
        expected: false,
      },
      {
        subject: {isJoker: true},
        target: {isJoker: false, suit: 'spade', rank: '2'},
        expected: true,
      },
      {
        subject: {isJoker: false, suit: 'spade', rank: '2'},
        target: {isJoker: true},
        expected: false,
      },
      {
        subject: {isJoker: true},
        target: {isJoker: true},
        expected: false,
      },
    ]
    for (const {subject, target, expected} of testCases) {
      it(`${strinfigyCard(subject)} is stronger than ${strinfigyCard(target)} => ${expected}`, () => {
        expect(expected).toBe(isCardRankStrongerThan(subject, target))
      })
    }
  })
  describe('areCardsEqual', () => {
    const testCases: {
      a: Card,
      b: Card,
      expected: boolean,
    }[] = [
      {
        a: {isJoker: true},
        b: {isJoker: true},
        expected: true,
      },
      {
        a: {isJoker: true},
        b: {isJoker: false, suit: 'spade', rank: '3'},
        expected: false,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: true},
        expected: false,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: false, suit: 'spade', rank: '3'},
        expected: true,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: false, suit: 'spade', rank: '4'},
        expected: false,
      },
      {
        a: {isJoker: false, suit: 'spade', rank: '3'},
        b: {isJoker: false, suit: 'club', rank: '3'},
        expected: false,
      },
    ]
    for (const {a, b, expected} of testCases) {
      it(`${strinfigyCard(a)} <> ${strinfigyCard(b)} => ${expected}`, () => {
        expect(expected).toBe(areCardsEqual(a, b))
      })
    }
  })
  describe('areCardCombinationsEqual', () => {
    const testCases: {
      name: string,
      a: CardCombination,
      b: CardCombination,
      expected: boolean,
    }[] = [
      {
        name: 'should return true when the cards are equal in the "single" category',
        a: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        b: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return true when the cards are equal in the "multiple" category',
        a: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        b: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return true when the cards are equal in the "sequence" category',
        a: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        b: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        expected: true,
      },
      {
        name: 'should ignore the order of the cards and judges that they are equal',
        a: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        b: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'club', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return false when the cards are not equal',
        a: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        b: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'club', rank: '4'},
          ],
        },
        expected: false,
      },
    ]
    for (const {name, a, b, expected} of testCases) {
      it(name, () => {
        expect(expected).toBe(areCardCombinationsEqual(a, b))
      })
    }
  })
  describe('isGameFinished', () => {
    it('should throw an error if there is no player', () => {
      expect(() => {
        isGameFinished(createGame())
      }).toThrowError(/no player/)
    })
    it('should return true if there is no ranking=0', () => {
      let game = createGame()
      game = appendPlayer(game, {...createPlayer(), id: 'a', ranking: 1})
      game = appendPlayer(game, {...createPlayer(), id: 'b', ranking: 2})
      game = appendPlayer(game, {...createPlayer(), id: 'c', ranking: 3})
      expect(isGameFinished(game)).toBe(true)
    })
    it('should return false if there is even one player with a ranking=0', () => {
      let game = createGame()
      game = appendPlayer(game, {...createPlayer(), id: 'a', ranking: 1})
      game = appendPlayer(game, {...createPlayer(), id: 'b', ranking: 0})
      game = appendPlayer(game, {...createPlayer(), id: 'c', ranking: 2})
      expect(isGameFinished(game)).toBe(false)
    })
  })
  describe('parseCardsToSingleCardCombinations', () => {
    it('works', () => {
      const cards: NotJokerCard[] = [
        {isJoker: false, suit: 'spade', rank: '3'},
        {isJoker: false, suit: 'heart', rank: '13'},
      ]
      expect(parseCardsToSingleCardCombinations(cards)).toEqual([
        {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'heart', rank: '13'},
          ],
        },
      ])
    })
  })
  describe('parseCardsToMultipleCardCombinations', () => {
    const testCases: {
      name: string,
      cards: NotJokerCard[],
      expected: CardCombination[],
    }[] = [
      {
        name: 'should return one combination if there are two cards of the same rank',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
        ],
        expected: [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ],
          },
        ],
      },
      {
        name: 'should return an empty if there are only cards of different ranks',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
        ],
        expected: [],
      },
      {
        name: 'should return 4 combinations (=3C2+3C3) when there are 3 cards of the same rank',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
          {isJoker: false, suit: 'diamond', rank: '3'},
        ],
        expected: [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
        ],
      },
      {
        name: 'should return 11 combinations (=4C2+4C3+4C4) when there are 4 cards of the same rank',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
          {isJoker: false, suit: 'diamond', rank: '3'},
          {isJoker: false, suit: 'heart', rank: '3'},
        ],
        expected: [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'diamond', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
            ],
          },
        ],
      },
      {
        name: 'can return combinations of different ranks',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'club', rank: '4'},
        ],
        expected: [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'club', rank: '4'},
            ],
          },
        ],
      },
      {
        name: 'should keep cards sorted by the order of default',
        cards: [
          {isJoker: false, suit: 'diamond', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        expected: [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
            ],
          },
        ],
      },
    ]
    for (const testCase of testCases) {
      it(testCase.name, () => {
        expect(parseCardsToMultipleCardCombinations(testCase.cards)).toEqual(testCase.expected)
      })
    }
  })
  describe('parseCardsToSequenceCardCombinations', () => {
    const testCases: {
      name: string,
      cards: NotJokerCard[],
      expected: CardCombination[],
    }[] = [
      {
        name: 'should return an empty if there is a sequence of 2 cards',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
        ],
        expected: [],
      },
      {
        name: 'should return 1 combination if there is a sequence of 3 cards',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '5'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ],
          },
        ],
      },
      {
        name: 'should return 3 combinations (=2+1) if there is a sequence of 4 cards',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '5'},
          {isJoker: false, suit: 'spade', rank: '6'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
              {isJoker: false, suit: 'spade', rank: '6'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
              {isJoker: false, suit: 'spade', rank: '6'},
            ],
          },
        ],
      },
      {
        name: 'should return 6 combinations (=3+2+1) if there is a sequence of higher 5 cards',
        cards: [
          {isJoker: false, suit: 'spade', rank: '11'},
          {isJoker: false, suit: 'spade', rank: '12'},
          {isJoker: false, suit: 'spade', rank: '13'},
          {isJoker: false, suit: 'spade', rank: '1'},
          {isJoker: false, suit: 'spade', rank: '2'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '11'},
              {isJoker: false, suit: 'spade', rank: '12'},
              {isJoker: false, suit: 'spade', rank: '13'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '11'},
              {isJoker: false, suit: 'spade', rank: '12'},
              {isJoker: false, suit: 'spade', rank: '13'},
              {isJoker: false, suit: 'spade', rank: '1'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '11'},
              {isJoker: false, suit: 'spade', rank: '12'},
              {isJoker: false, suit: 'spade', rank: '13'},
              {isJoker: false, suit: 'spade', rank: '1'},
              {isJoker: false, suit: 'spade', rank: '2'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '12'},
              {isJoker: false, suit: 'spade', rank: '13'},
              {isJoker: false, suit: 'spade', rank: '1'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '12'},
              {isJoker: false, suit: 'spade', rank: '13'},
              {isJoker: false, suit: 'spade', rank: '1'},
              {isJoker: false, suit: 'spade', rank: '2'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '13'},
              {isJoker: false, suit: 'spade', rank: '1'},
              {isJoker: false, suit: 'spade', rank: '2'},
            ],
          },
        ],
      },
      {
        name: 'can return combinations of different suits',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'club', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '5'},
          {isJoker: false, suit: 'club', rank: '5'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'club', rank: '4'},
              {isJoker: false, suit: 'club', rank: '5'},
            ],
          },
        ],
      },
      {
        name: 'can recognize separated sequences',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '5'},
          {isJoker: false, suit: 'spade', rank: '7'},
          {isJoker: false, suit: 'spade', rank: '8'},
          {isJoker: false, suit: 'spade', rank: '9'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ],
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '7'},
              {isJoker: false, suit: 'spade', rank: '8'},
              {isJoker: false, suit: 'spade', rank: '9'},
            ],
          },
        ],
      },
      {
        name: 'should keep cards sorted by the order of default',
        cards: [
          {isJoker: false, suit: 'spade', rank: '5'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        expected: [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ],
          },
        ],
      },
    ]
    for (const testCase of testCases) {
      it(testCase.name, () => {
        expect(parseCardsToSequenceCardCombinations(testCase.cards)).toEqual(testCase.expected)
      })
    }
  })
  describe('parseCardsToCardCombinations', () => {
    describe('when cards return combinations of all categories', () => {
      const cards: Card[] = [
        {isJoker: false, suit: 'spade', rank: '3'},
        {isJoker: false, suit: 'club', rank: '3'},
        {isJoker: false, suit: 'spade', rank: '4'},
        {isJoker: false, suit: 'spade', rank: '5'},
      ]

      it('should return all categories', () => {
        const expected: CardCombination[] = [
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '4'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '5'},
            ]
          },
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ]
          },
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ]
          },
        ]
        expect(expected).toEqual(parseCardsToCardCombinations(cards))
      })
      it('can return only "single" category', () => {
        const expected: CardCombination[] = [
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'club', rank: '3'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '4'},
            ]
          },
          {
            category: 'single',
            cards: [
              {isJoker: false, suit: 'spade', rank: '5'},
            ]
          },
        ]
        expect(expected).toEqual(parseCardsToCardCombinations(cards, {categories: ['single']}))
      })
      it('can return only "multiple" category', () => {
        const expected: CardCombination[] = [
          {
            category: 'multiple',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
            ]
          },
        ]
        expect(expected).toEqual(parseCardsToCardCombinations(cards, {categories: ['multiple']}))
      })
      it('can return only "sequence" category', () => {
        const expected: CardCombination[] = [
          {
            category: 'sequence',
            cards: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'spade', rank: '5'},
            ]
          },
        ]
        expect(expected).toEqual(parseCardsToCardCombinations(cards, {categories: ['sequence']}))
      })
    })
  })
  describe('canPutDownCardCombination', () => {
    const testCases: {
      name: string,
      pulledOut: CardCombination,
      layouted: CardCombination,
      expected: boolean,
    }[] = [
      {
        name: 'should return true when the pulled out single combination is stronger than the layouted one',
        pulledOut: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
          ],
        },
        layouted: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return false when the strength of the pulled out single combination equals the layouted one',
        pulledOut: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        layouted: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        expected: false,
      },
      {
        name: 'should return false when the pulled out single combination is strong but the categories are different',
        pulledOut: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
          ],
        },
        layouted: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        expected: false,
      },
      {
        name: 'should return true when the pulled out multiple combination is stronger than the layouted one',
        pulledOut: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'club', rank: '4'},
          ],
        },
        layouted: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return false when the strength of the pulled out multiple combination equals the layouted one',
        pulledOut: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        layouted: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        },
        expected: false,
      },
      {
        name: 'should return false when the pulled out multiple combination is strong but the categories are different',
        pulledOut: {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'club', rank: '4'},
          ],
        },
        layouted: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        expected: false,
      },
      {
        name: 'should return true when the pulled out sequence combination is stronger than the layouted one',
        pulledOut: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
            {isJoker: false, suit: 'spade', rank: '6'},
          ],
        },
        layouted: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        expected: true,
      },
      {
        name: 'should return false when the strength of the pulled out sequence combination equals the layouted one',
        pulledOut: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        layouted: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
          ],
        },
        expected: false,
      },
      {
        name: 'should return false when the pulled out sequence combination is strong but the categories are different',
        pulledOut: {
          category: 'sequence',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'spade', rank: '5'},
            {isJoker: false, suit: 'spade', rank: '6'},
          ],
        },
        layouted: {
          category: 'single',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
          ],
        },
        expected: false,
      },
    ]
    for (const {name, pulledOut, layouted, expected} of testCases) {
      it(name, () => {
        expect(canPutDownCardCombination(pulledOut, layouted)).toBe(expected)
      })
    }
  })
  describe('removeCards', () => {
    const testCases: {
      name: string,
      subject: Card[],
      removed: Card[],
      expected: Card[],
    }[] = [
      {
        name: 'should remove one from one',
        subject: [
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        removed: [
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        expected: [],
      },
      {
        name: 'should remove one from two different',
        subject: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
        ],
        removed: [
          {isJoker: false, suit: 'spade', rank: '4'},
        ],
        expected: [
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
      },
      {
        name: 'should remove one from the same two',
        subject: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        removed: [
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
        expected: [
          {isJoker: false, suit: 'spade', rank: '3'},
        ],
      },
      {
        name: 'should remove two from the three different',
        subject: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '4'},
          {isJoker: false, suit: 'spade', rank: '5'},
        ],
        removed: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'spade', rank: '5'},
        ],
        expected: [
          {isJoker: false, suit: 'spade', rank: '4'},
        ],
      },
    ]
    for (const {name, subject, removed, expected} of testCases) {
      it(name, () => {
        expect(removeCards(subject, removed)).toEqual(expected)
      })
    }
  })
})

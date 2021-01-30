import {
  appendPlayer,
  clearHands,
  dealCards,
  desideDealerAndFirstPlayer,
  proceedTurn,
  resetStock,
} from '../index'
import {
  Game,
  areCardsEqual,
  createGame,
  createPlayer,
  CardCombination,
  getPassedPlayerIndexes,
} from '../utils'

describe('src/index', () => {
  describe('appendPlayer', () => {
    it('can append a player', () => {
      let game = createGame()
      const player = createPlayer()
      const beforePlayerCount = game.players.length
      game = appendPlayer(game, player)
      expect(game.players.length).toBe(beforePlayerCount + 1)
    })
    it('should throw an error when player.id is duplicated', () => {
      let game = createGame()
      const player1 = {...createPlayer(), id: 'a'}
      const player2 = {...createPlayer(), id: 'a'}
      game = appendPlayer(game, player1)
      expect(() => {
        appendPlayer(game, player2)
      }).toThrowError(/duplicated/)
    })
  })
  describe('desideDealerAndFirstPlayer', () => {
    let game: Game
    beforeEach(() => {
      game = createGame()
      game = appendPlayer(game, {...createPlayer(), id: 'a'})
      game = appendPlayer(game, {...createPlayer(), id: 'b'})
    })
    // TODO: まだ実装がないため。
    describe.skip('when in the first game', () => {
    })
    describe('when in the second game', () => {
      it('should deside to the player having grade 1', () => {
        game = {
          ...game,
          players: game.players.map((player, index) => {
            return {
              ...player,
              grade: index === 0 ? 5 : 1,
            }
          })
        }
        game = desideDealerAndFirstPlayer(game)
        expect(game.dealerIndex).toBe(1)
        expect(game.playerIndexOnTurn).toBe(1)
      })
    })
  })
  describe('clearHands', () => {
    let game: Game
    beforeEach(() => {
      game = createGame()
      game = appendPlayer(game, {...createPlayer(), id: 'a'})
      game = appendPlayer(game, {...createPlayer(), id: 'b'})
      game = resetStock(game)
      game = desideDealerAndFirstPlayer(game)
      game = dealCards(game)
    })
    it('should clear hands of all players', () => {
      expect(game.players[0].hand).not.toEqual([])
      expect(game.players[1].hand).not.toEqual([])
      game = clearHands(game)
      expect(game.players[0].hand).toEqual([])
      expect(game.players[1].hand).toEqual([])
    })
  })
  describe('resetStock', () => {
    let game: Game
    beforeEach(() => {
      game = resetStock(createGame())
    })
    it('should append 52 cards', () => {
      expect(game.stock.length).toBe(52)
    })
    it('should append cards non-duplicated each other', () => {
      for (const a of game.stock) {
        const filtered = game.stock.filter(b => areCardsEqual(a, b))
        expect(filtered.length).toBe(1)
      }
    })
  })
  describe('dealCards', () => {
    let game: Game
    beforeEach(() => {
      game = createGame()
      game = resetStock(game)
    })
    describe('when there are 3 players and the first is the dealerIndex', () => {
      beforeEach(() => {
        game = appendPlayer(game, {
          ...createPlayer(),
          id: '0',
        })
        game = appendPlayer(game, {
          ...createPlayer(),
          id: '1',
        })
        game = appendPlayer(game, {
          ...createPlayer(),
          id: '2',
        })
        game = {...game, dealerIndex: 0}
        game = dealCards(game)
      })
      it('should deal cards at a ratio of 17/18/17', () => {
        expect(game.players[0].hand.length).toBe(17)
        expect(game.players[1].hand.length).toBe(18)
        expect(game.players[2].hand.length).toBe(17)
      })
    })
  })
  describe('proceedTurn', () => {
    let game: Game
    beforeEach(() => {
      game = createGame()
      game = appendPlayer(game, {...createPlayer(), id: 'a'})
      game = appendPlayer(game, {...createPlayer(), id: 'b'})
      game = appendPlayer(game, {...createPlayer(), id: 'c'})
      game = appendPlayer(game, {...createPlayer(), id: 'd'})
      game = {
        ...game,
        players: game.players.map(player => {
          return {
            ...player,
            hand: [
              {isJoker: false, suit: 'spade', rank: '3'},
              {isJoker: false, suit: 'club', rank: '3'},
              {isJoker: false, suit: 'diamond', rank: '3'},
              {isJoker: false, suit: 'heart', rank: '3'},
              {isJoker: false, suit: 'spade', rank: '4'},
              {isJoker: false, suit: 'club', rank: '4'},
              {isJoker: false, suit: 'diamond', rank: '4'},
              {isJoker: false, suit: 'heart', rank: '4'},
            ],
          }
        }),
      }
    })
    it('should throw an error if `game.playerIndexOnTurn` is undefined', () => {
      expect(() => {
        proceedTurn(game, undefined)
      }).toThrowError(/playerIndexOnTurn/)
    })
    describe('when the layouted card combination does not exist in the first turn', () => {
      describe('when the pulled out card combination does not exist', () => {
        const playerIndexOnTurn = 0
        beforeEach(() => {
          game = {...game, playerIndexOnTurn}
          game = proceedTurn(game, undefined)
        })
        it('should store the result of the player\'s pass in the last turn', () => {
          const lastRound = game.rounds[game.rounds.length - 1]
          const lastTurn = lastRound.turns[lastRound.turns.length - 1]
          expect(lastTurn.playerIndex).toBe(playerIndexOnTurn)
          expect(lastTurn.cardCombination).toBe(undefined)
        })
        it('should move the turn to the next player', () => {
          expect(game.playerIndexOnTurn).toBe(playerIndexOnTurn + 1)
        })
      })
      describe('when the pulled out card combination exists', () => {
        const playerIndexOnTurn = 0
        const pulledOutCardCombination: CardCombination = {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
          ],
        }
        beforeEach(() => {
          game = {...game, playerIndexOnTurn}
          game = proceedTurn(game, pulledOutCardCombination)
        })
        it('should store the player\'s pulled out card combination in the last turn', () => {
          const lastRound = game.rounds[game.rounds.length - 1]
          const lastTurn = lastRound.turns[lastRound.turns.length - 1]
          expect(lastTurn.playerIndex).toBe(playerIndexOnTurn)
          expect(lastTurn.cardCombination).toEqual(pulledOutCardCombination)
        })
        it('should move the turn to the next player', () => {
          expect(game.playerIndexOnTurn).toBe(playerIndexOnTurn + 1)
        })
      })
    })
    describe('when the layouted card combination exists in the 2nd turn', () => {
      const playerIndexOnTurn = 1
      const layoutedCardCombination: CardCombination = {
        category: 'multiple',
        cards: [
          {isJoker: false, suit: 'spade', rank: '3'},
          {isJoker: false, suit: 'club', rank: '3'},
        ],
      }
      beforeEach(() => {
        game = {...game, playerIndexOnTurn}
        game.rounds[game.rounds.length - 1].turns.push({
          playerIndex: playerIndexOnTurn - 1,
          cardCombination: layoutedCardCombination,
        })
      })
      describe('when the pulled out card combination does not exist', () => {
        beforeEach(() => {
          game = proceedTurn(game, undefined)
        })
        it('should store the result of the player\'s pass in the last turn', () => {
          const lastRound = game.rounds[game.rounds.length - 1]
          const lastTurn = lastRound.turns[lastRound.turns.length - 1]
          expect(lastTurn.playerIndex).toBe(playerIndexOnTurn)
          expect(lastTurn.cardCombination).toBe(undefined)
        })
        it('should move the turn to the next player', () => {
          expect(game.playerIndexOnTurn).toBe(playerIndexOnTurn + 1)
        })
      })
      describe('when the pulled out card combination exists and it can put down', () => {
        const pulledOutCardCombination: CardCombination = {
          category: 'multiple',
          cards: [
            {isJoker: false, suit: 'spade', rank: '4'},
            {isJoker: false, suit: 'club', rank: '4'},
          ],
        }
        beforeEach(() => {
          game = proceedTurn(game, pulledOutCardCombination)
        })
        it('should store the player\'s pulled out card combination in the last turn', () => {
          const lastRound = game.rounds[game.rounds.length - 1]
          const lastTurn = lastRound.turns[lastRound.turns.length - 1]
          expect(lastTurn.playerIndex).toBe(playerIndexOnTurn)
          expect(lastTurn.cardCombination).toEqual(pulledOutCardCombination)
        })
        it('should move the turn to the next player', () => {
          expect(game.playerIndexOnTurn).toBe(playerIndexOnTurn + 1)
        })
        it('should reduce the player\'s hand', () => {
          expect(game.players[playerIndexOnTurn].hand).toEqual([
            {isJoker: false, suit: 'spade', rank: '3'},
            {isJoker: false, suit: 'club', rank: '3'},
            {isJoker: false, suit: 'diamond', rank: '3'},
            {isJoker: false, suit: 'heart', rank: '3'},
            {isJoker: false, suit: 'diamond', rank: '4'},
            {isJoker: false, suit: 'heart', rank: '4'},
          ])
        })
      })
      describe('when the pulled out card combination exists and it can not put down', () => {
        it('should throw an error', () => {
          expect(() => {
            proceedTurn(game, {
              category: 'multiple',
              cards: [
                {isJoker: false, suit: 'spade', rank: '3'},
                {isJoker: false, suit: 'club', rank: '3'},
              ],
            })
          }).toThrowError(/not a card combination/)
        })
      })
    })
    describe('when the next player has passed', () => {
      describe('when the next player\'s index is not the last of players', () => {
        let passedPlayerIndex: number
        beforeEach(() => {
          passedPlayerIndex = game.players.length - 2
          game.rounds[game.rounds.length - 1].turns.push({
            playerIndex: passedPlayerIndex,
            cardCombination: undefined,
          })
        })
        it('should skip the next player', () => {
          game = {...game, playerIndexOnTurn: passedPlayerIndex - 1}
          game = proceedTurn(game, undefined)
          expect(game.playerIndexOnTurn).toBe(passedPlayerIndex + 1)
        })
      })
      describe('when the next player\'s index is the last of players', () => {
        let passedPlayerIndex: number
        beforeEach(() => {
          passedPlayerIndex = game.players.length - 1
          game.rounds[game.rounds.length - 1].turns.push({
            playerIndex: passedPlayerIndex,
            cardCombination: undefined,
          })
        })
        it('should skip the next player and select the first player', () => {
          game = {...game, playerIndexOnTurn: passedPlayerIndex - 1}
          game = proceedTurn(game, undefined)
          expect(game.playerIndexOnTurn).toBe(0)
        })
      })
    })
    describe('when the last two players are alive in the turn', () => {
      const passedPlayerIndexes = [2, 3]
      beforeEach(() => {
        for (const e of passedPlayerIndexes) {
          game.rounds[game.rounds.length - 1].turns.push({
            playerIndex: e,
            cardCombination: undefined,
          })
        }
      })
      describe('when the index=0 player has passed', () => {
        let beforeGame: Game
        beforeEach(() => {
          beforeGame = game
          game = {...game, playerIndexOnTurn: 0}
          game = proceedTurn(game, undefined)
        })
        it('should proceed to the next round', () => {
          game = proceedTurn(game, undefined)
          expect(game.rounds.length).toBe(beforeGame.rounds.length + 1)
        })
        it('should move the turn to the index=1 player', () => {
          expect(game.playerIndexOnTurn).toBe(1)
        })
      })
      describe('when the index=1 player has passed', () => {
        let beforeGame: Game
        beforeEach(() => {
          beforeGame = game
          game = {...game, playerIndexOnTurn: 1}
          game = proceedTurn(game, undefined)
        })
        it('should proceed to the next round', () => {
          game = proceedTurn(game, undefined)
          expect(game.rounds.length).toBe(beforeGame.rounds.length + 1)
        })
        it('should move the turn to the index=0 player', () => {
          expect(game.playerIndexOnTurn).toBe(0)
        })
      })
    })
    describe('when two players remain in the game and one player is out', () => {
      const playerIndexOnTurn = 0
      beforeEach(() => {
        game = {
          ...game,
          players: [
            {
              ...game.players[0],
              hand: [
                {isJoker: false, suit: 'spade', rank: '3'},
              ]
            },
            game.players[1],
            {
              ...game.players[2],
              hand: [],
              ranking: 1,
            },
            {
              ...game.players[3],
              hand: [],
              ranking: 2,
            },
          ],
          playerIndexOnTurn,
        }
        game = proceedTurn(game, {
          category: 'single',
          cards: [{isJoker: false, suit: 'spade', rank: '3'}],
        })
      })
      it('should set the next ranking for the player who is out', () => {
        expect(game.players[playerIndexOnTurn].ranking).toBe(3)
      })
      it('should finish the game', () => {
        expect(game.players.every(e => e.ranking !== 0)).toBe(true)
      })
    })
  })
})

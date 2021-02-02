import * as daifugo from '../../src/index'
import { createPlayer } from '../../src/utils'

const keypress = require('keypress')

type KeypressKey = Readonly<{
  ctrl: boolean,
  name: string,
}>

const stringifyCard = (card: daifugo.Card): string => daifugo.isJokerCardType(card)
  ? 'Joker' : `${card.suit[0]}${card.rank}`

const renderGameToText = (game: daifugo.Game): string => {
  let lines: string[] = []
  lines.push(`<Round: ${game.rounds.length}>`)
  for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
    const player = game.players[playerIndex]
    lines.push(
      `[${player.id.padStart(4, ' ')}]` +
      ` cards=${player.hand.length.toString().padStart(2, '0')}` +
      `, ranking=${player.ranking}` +
      (playerIndex === game.playerIndexOnTurn ? ' *' : '')
    )
  }
  return lines.join('\n')
}

const yourId = 'you'
const playerIds: readonly string[] = [yourId, 'cpu1', 'cpu2', 'cpu3', 'cpu4']
const yourPlayerIndex = playerIds.indexOf(yourId)

let game = daifugo.createGame()
game = playerIds.reduce((acc, id) => daifugo.appendPlayer(acc, {...daifugo.createPlayer(), id}), game)
game = daifugo.resetStock(game)
game = daifugo.desideDealerAndFirstPlayer(game)
// TODO: 上の関数がまだ未完成なため。
const dealerIndex = Math.floor(Math.random() * 5)
game = {
  ...game,
  dealerIndex,
  playerIndexOnTurn: dealerIndex,
}
game = daifugo.dealCards(game)

const handleKeypress = (ch: string, key: KeypressKey): void => {
  if (key.ctrl && key.name == 'c' || key.ctrl && key.name == 'd' || key.ctrl && key.name == 'q') {
    process.exit(0)
  }
  let lines: string[] = []
  if (daifugo.isGameFinished(game)) {
    lines.push('')
    lines.push('This game was over.')
    lines.push('')
    lines.push(renderGameToText(game))
  } else {
    if (game.playerIndexOnTurn === undefined) {
      throw new Error('playerIndexOnTurn is undefined.')
    }
    const playerOnTurn = game.players[game.playerIndexOnTurn]
    const cardCombinations = daifugo.parseCardsToCardCombinations(playerOnTurn.hand)
    const layouted = daifugo.getLayoutedCardCombination(game.rounds)
    const candidates: daifugo.CardCombination[] = layouted
      ? cardCombinations.filter(cardCombination => daifugo.canPutDownCardCombination(cardCombination, layouted))
      : cardCombinations
    const pulledOut: daifugo.CardCombination | undefined = candidates.length > 0
      ? daifugo.shuffleArray<daifugo.CardCombination | undefined>(
        [...candidates, undefined], Math.random)[0]
      : undefined
    if (game.rounds[game.rounds.length - 1].turns.length === 0) {
      lines.push('')
      lines.push(renderGameToText(game) + '')
      lines.push('')
    }
    if (pulledOut) {
      lines.push(`${playerOnTurn.id} puts down the card(s) of [${pulledOut.cards.map(e => stringifyCard(e)).join(', ')}].`)
    } else {
      lines.push(`${playerOnTurn.id} passes the turn.`)
    }
    game = daifugo.proceedTurn(game, pulledOut)
  }
  process.stdout.write(lines.join('\n') + '\n')
}

// Settings for "keypress" module.
keypress(process.stdin)
process.stdin.on('keypress', handleKeypress)

// Start the main process.
process.stdout.write('Start the game.\n')
process.stdin.setRawMode(true)
process.stdin.resume()

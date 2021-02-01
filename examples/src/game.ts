import * as daifugo from '../../src/index'
import { createPlayer } from '../../src/utils'

const keypress = require('keypress')

type KeypressKey = Readonly<{
  ctrl: boolean,
  name: string,
}>

const stringifyCard = (card: daifugo.utils.Card): string => daifugo.utils.isJokerCardType(card)
  ? 'Joker' : `${card.suit[0]}${card.rank}`

const renderGameToText = (game: daifugo.utils.Game): string => {
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
const playerIds: readonly string[] =
  daifugo.utils.shuffleArray<string>([yourId, 'cpu1', 'cpu2', 'cpu3', 'cpu4'], Math.random)
const yourPlayerIndex = playerIds.indexOf(yourId)

let game = daifugo.utils.createGame()
game = playerIds.reduce((acc, id) => daifugo.appendPlayer(acc, {...daifugo.utils.createPlayer(), id}), game)
game = daifugo.resetStock(game)
game = daifugo.desideDealerAndFirstPlayer(game)
game = daifugo.dealCards(game)

const handleKeypress = (ch: string, key: KeypressKey): void => {
  if (key.ctrl && key.name == 'c' || key.ctrl && key.name == 'd' || key.ctrl && key.name == 'q') {
    process.exit(0)
  }
  let lines: string[] = []
  if (daifugo.utils.isGameFinished(game)) {
    lines.push('')
    lines.push('This game was over.')
    lines.push('')
    lines.push(renderGameToText(game))
  } else {
    if (game.playerIndexOnTurn === undefined) {
      throw new Error('playerIndexOnTurn is undefined.')
    }
    const playerOnTurn = game.players[game.playerIndexOnTurn]
    const cardCombinations = daifugo.utils.parseCardsToCardCombinations(playerOnTurn.hand)
    const layouted = daifugo.utils.getLayoutedCardCombination(game.rounds)
    const candidates: daifugo.utils.CardCombination[] = layouted
      ? cardCombinations.filter(cardCombination => daifugo.utils.canPutDownCardCombination(cardCombination, layouted))
      : cardCombinations
    const pulledOut: daifugo.utils.CardCombination | undefined = candidates.length > 0
      ? daifugo.utils.shuffleArray<daifugo.utils.CardCombination | undefined>(
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

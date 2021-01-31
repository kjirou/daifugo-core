import * as daifugo from '../../src/index'

const keypress = require('keypress')

type KepressKey = {
  ctrl: boolean,
  name: string,
}

let game = daifugo.utils.createGame()

const handleKeypress = (ch: string, key: KepressKey): void => {
  if (key.ctrl && key.name == 'c' || key.ctrl && key.name == 'd' || key.ctrl && key.name == 'q') {
    process.exit(0)
  }
}

// Settings for "keypress" module.
keypress(process.stdin)
process.stdin.on('keypress', handleKeypress)

// Start the main process.
process.stdout.write('Start the game.\n')
process.stdin.setRawMode(true)
process.stdin.resume()

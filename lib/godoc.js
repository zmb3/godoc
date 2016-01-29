'use babel'

import {CompositeDisposable} from 'atom'

class Godoc {
  constructor (goconfigFunc) {
    this.goconfig = goconfigFunc
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor', 'godoc:showdoc',
      () => this.commandInvoked()))
  }

  commandInvoked () {
    console.log('command invoked')
  }

  dispose () {
    this.subscriptions.dispose()
    this.subscriptions = null
    this.goconfig = null
  }
}

export {Godoc}

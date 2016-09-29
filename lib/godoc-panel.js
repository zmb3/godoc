'use babel'

import {CompositeDisposable} from 'atom'

export default class GodocPanel {
  constructor (goconfigFunc) {
    this.key = 'reference'
    this.doc = 'Place the cursor on a symbol and run the "golang:showdoc" command (bound to alt-d by default)...'
    this.subscriptions = new CompositeDisposable()
  }

  dispose () {
    if (this.subscriptions) {
      this.subscriptions.dispose()
    }
    this.subscriptions = null
  }

  updateContent (doc) {
    this.doc = doc
    if (!doc) {
      return
    }
    if (this.requestFocus) {
      this.requestFocus()
    }
    if (this.view) {
      this.view.update()
    }
  }
}

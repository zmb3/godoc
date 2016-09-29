'use babel'

import {CompositeDisposable} from 'atom'

export default class GodocPanel {
  constructor (goconfigFunc) {
    this.key = 'reference'
    this.doc = 'Place the cursor on a symbol and run the "golang:showdoc" command (bound to alt-d by default)...'
    this.subscriptions = new CompositeDisposable()
    this.subscribeToConfig()
  }

  dispose () {
    if (this.subscriptions) {
      this.subscriptions.dispose()
    }
    this.subscriptions = null
  }

  subscribeToConfig () {
    this.subscriptions.add(atom.config.observe('editor.fontFamily', (v) => {
      this.setViewPropertyAndUpdate('fontFamily', v)
    }))
    this.subscriptions.add(atom.config.observe('editor.fontSize', (v) => {
      this.setViewPropertyAndUpdate('fontSize', v)
    }))
    this.subscriptions.add(atom.config.observe('editor.lineHeight', (v) => {
      this.setViewPropertyAndUpdate('lineHeight', v)
    }))
  }

  setViewPropertyAndUpdate (prop, value) {
    if (!this.view) {
      return
    }
    let props = {}
    props[prop] = value
    this.view.update(props)
  }

  updateContent (doc) {
    this.doc = doc
    if (this.view && this.doc) {
      this.view.update()
    }
  }
}

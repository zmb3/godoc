'use babel'

import {CompositeDisposable} from 'atom'
import {Godoc} from './godoc'

export default {
  subscriptions: null,
  dependenciesInstalled: null,
  goconfig: null,
  godoc: null,

  activate () {
    this.godoc = new Godoc(() => { return this.getGoconfig() })
    this.subscriptions = new CompositeDisposable()
    require('atom-package-deps').install('godoc').then(() => {
      this.dependenciesInstalled = true
    }).catch((e) => {
      console.log(e)
    })
  },

  deactivate () {
    if (this.subscriptions) {
      this.subscriptions.dispose()
    }
    this.subscriptions = null
    this.godoc = null
    this.goconfig = null
    this.dependenciesInstalled = null
  },

  getGoconfig () {
    if (this.goconfig) {
      return this.goconfig
    }
    return false
  },

  consumeGoconfig (service) {
    this.goconfig = service
  }
}

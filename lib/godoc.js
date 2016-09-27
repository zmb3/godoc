'use babel'

import path from 'path'
import {CompositeDisposable, Point} from 'atom'
import GodocView from './godoc-view'

class Godoc {
  constructor (goconfigFunc, gogetFunc) {
    this.view = GodocView.create()
    this.view.setCloseCallback(() => { this.hideView() })

    this.goconfig = goconfigFunc
    this.goget = gogetFunc
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor', 'golang:showdoc',
      () => this.commandInvoked()))
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor.godoc-display-active', 'core:cancel',
      () => this.hideView()))
  }

  commandInvoked () {
    let editor = atom.workspace.getActiveTextEditor()
    if (!this.isValidEditor(editor)) {
      return
    }

    this.hideView()
    this.marker = editor.markBufferRange(editor.getLastCursor().getCurrentWordBufferRange())

    // the decoration created here is destroyed when the corresponding marker is
    editor.decorateMarker(this.marker, {
      type: 'overlay',
      item: this.view,
      position: 'tail'
    })
    this.view.setInProgress()

    return this.checkForTool(editor).then((cmd) => {
      if (!cmd) {
        // TODO: notification?
        return {success: false, result: null}
      }
      let file = editor.getBuffer().getPath()
      let cwd = path.dirname(file)
      let offset = this.editorByteOffset(editor)

      // package up unsaved buffers in the Guru archive format
      let archive = ''
      for (let e of atom.workspace.getTextEditors()) {
        if (e.isModified() && this.isValidEditor(e)) {
          archive += e.getTitle() + '\n'
          archive += Buffer.byteLength(e.getText(), 'utf8') + '\n'
          archive += e.getText()
        }
      }
      return this.getDoc(file, offset, cwd, cmd, archive)
    })
  }

  checkForTool (editor) {
    if (!this.goconfig || !this.goconfig()) {
      return Promise.resolve(false)
    }

    let config = this.goconfig()
    let options = {}
    if (editor && editor.getPath()) {
      options.file = editor.getPath()
      options.directory = path.dirname(options.file)
    }

    if (!options.directory && atom.project.getPaths().length > 0) {
      options.directory = atom.project.getPaths()[0]
    }

    return config.locator.findTool('gogetdoc', options).then((cmd) => {
      if (cmd) {
        return cmd
      }
      // first check for Go 1.6+, if we don't have that, don't even offer to
      // 'go get', since it will definitely fail
      return config.locator.runtime(options).then((runtime) => {
        if (!runtime) {
          return false
        }
        let components = runtime.semver.split('.')
        if (!components || components.length < 2) {
          return false
        }
        let minor = parseInt(components[1], 10)
        if (minor < 6) {
          atom.notifications.addError('godoc requires Go 1.6 or later', {
            detail: 'The godoc package uses the `gogetdoc` tool, which requires Go 1.6 or later; please update your Go installation to use this package.',
            dismissable: true
          })
          this.hideView()
          return false
        }
        if (!this.goget || !this.goget()) {
          this.hideView()
          return false
        }
        let get = this.goget()
        return get.get({
          name: 'gogetdoc',
          packageName: 'gogetdoc',
          packagePath: 'github.com/zmb3/gogetdoc',
          type: 'missing'
        }).then((r) => {
          if (r.success) {
            return config.locator.findTool('gogetdoc', options)
          }
          this.hideView()
          console.log('gogetdoc is not available and could not be installed via "go get -u github.com/zmb3/gogetdoc"; please manually install it to enable doc functionality')
          return false
        }).catch((e) => {
          console.log(e)
        })
      })
    })
  }

  hideView () {
    if (this.marker) {
      this.marker.destroy()
      this.marker = null
    }
    if (this.view) {
      this.view.removeActiveClassFromEditor()
    }
  }

  dispose () {
    this.hideView()
    this.subscriptions.dispose()
    this.subscriptions = null
    this.goconfig = null
  }

  getDoc (file, offset, cwd, cmd, stdin) {
    let config = this.goconfig()
    if (!config || !config.executor) {
      return {success: false, result: null}
    }

    // use a large line length because Atom will wrap the paragraphs automatically
    let args = ['-pos', `${file}:#${offset}`, '-linelength', '999']

    let options = {cwd: cwd}
    if (stdin && stdin !== '') {
      args.push('-modified')
      options.input = stdin
      console.log(stdin)
    }

    return config.executor.exec(cmd, args, options).then((r) => {
      if (r.error) {
        if (r.error.code === 'ENOENT') {
          atom.notifications.addError('Missing Tool', {
            detail: 'Missing the `gogetdoc` tool.',
            dismissable: true
          })
        } else {
          atom.notifications.addError('Error', {
            detail: r.error.message,
            dismissable: true
          })
        }
        return {success: false, result: r}
      }
      let message = r.stdout.trim()
      if (message) {
        this.view.updateText(message)
      }

      if (r.exitcode !== 0 || r.stderr && r.stderr.trim() !== '') {
        // TODO: notification?
        return {success: false, result: r}
      }

      return {success: true, result: r}
    })
  }

  isValidEditor (editor) {
    if (!editor) {
      return false
    }
    let grammar = editor.getGrammar()
    return grammar && grammar.scopeName === 'source.go'
  }

  editorByteOffset (editor) {
    let cursor = editor.getLastCursor()
    let range = cursor.getCurrentWordBufferRange()
    let middle = new Point(range.start.row, Math.floor((range.start.column + range.end.column) / 2))
    let charOffset = editor.buffer.characterIndexForPosition(middle)
    let text = editor.getText().substring(0, charOffset)
    return Buffer.byteLength(text, 'utf8')
  }
}

export {Godoc}

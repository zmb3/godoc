'use babel'

import path from 'path'
import {CompositeDisposable, Point} from 'atom'
import GodocView from './godoc-view'

class Godoc {
  constructor (goconfigFunc) {
    this.view = GodocView.create()
    this.view.setCloseCallback(() => { this.hideView() })

    this.goconfig = goconfigFunc
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor', 'godoc:showdoc',
      () => this.commandInvoked()))
    this.subscriptions.add(atom.commands.add(
      'atom-text-editor.godoc-display-active', 'godoc:hide',
      () => this.hideView()))
  }

  commandInvoked () {
    let editor = atom.workspace.getActiveTextEditor()
    if (!this.isValidEditor(editor)) {
      return
    }
    if (editor.isModified()) {
      editor.save()
    }
    let file = editor.getBuffer().getPath()
    let cwd = path.dirname(file)
    let offset = this.editorByteOffset(editor)
    this.hideView()
    this.marker = editor.markBufferRange(editor.getLastCursor().getCurrentWordBufferRange())

    // the decoration created here is destroyed when the corresponding marker is
    editor.decorateMarker(this.marker, {
      type: 'overlay',
      item: this.view,
      position: 'tail'
    })
    this.view.setInProgress()
    return this.getDoc(file, offset, cwd)
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

  getDoc (file, offset, cwd) {
    let config = this.goconfig()
    if (!config || !config.executor) {
      return {success: false, result: null}
    }

    // use a large line length because Atom will wrap the paragraphs automatically
    let args = ['-pos', `${file}:#${offset}`, '-linelength', '999']

    return config.executor.exec('gogetdoc', args, {cwd: cwd}).then((r) => {
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

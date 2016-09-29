/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

export default class GodocPanelView {
  constructor (props) {
    if (props.model) {
      props.model.view = this
    }
    props.fontFamily = atom.config.get('editor.fontFamily')
    props.fontSize = atom.config.get('editor.fontSize')
    props.lineHeight = atom.config.get('editor.lineHeight')
    this.props = props

    etch.initialize(this)
    etch.setScheduler(atom.views)
  }

  update (props) {
    let oldProps = this.props
    this.props = Object.assign({}, oldProps, props)
    return etch.update(this)
  }

  dispose () {
    this.destroy()
  }

  destroy () {
    etch.destroy(this)
  }

  render () {
    let style = `font-family: ${this.props.fontFamily}; font-size: ${this.props.fontSize}px; line-height: ${this.props.lineHeight};`
    return (
      <div>
        <span tabindex='0' className="godoc-panel" style={style}>{this.props.model.doc}</span>
      </div>
    )
  }
}

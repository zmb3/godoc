/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

export default class GodocPanelView {
  constructor (props) {
    if (props.model) {
      props.model.view = this
    }

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

  toggleFollowCursor () {
    this.props.model.docFollowsCursor = !this.props.model.docFollowsCursor
    return etch.update(this)
  }

  render () {
    return (
      <div className='godoc-panel'>
        <div className='godoc-doc'>
          <div>
            <span tabindex='0'>{this.props.model.doc}</span>
          </div>
        </div>
        <label className='input-label godoc-follow-cursor'><input className='input-checkbox' type='checkbox' checked={this.props.model.docFollowsCursor} onchange={() => this.toggleFollowCursor()} /> Follow Cursor</label>
      </div>
    )
  }
}

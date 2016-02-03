'use babel'

const ViewTemplate = `
<div class="godoc-tooltip">
  <div id="godoc-message" class="message item"></div>
  <div id="godoc-progress">
    <span class='loading loading-spinner-large inline-block'></span>
  </div>
</div>
`

export default class GodocView extends HTMLElement {

  createdCallback () {
    this.innerHTML = ViewTemplate
    this.message = this.querySelector('#godoc-message')
    this.progress = this.querySelector('#godoc-progress')
    this.setInProgress()
  }

  updateText (text) {
    this.message.innerText = text
    this.message.classList.remove('godoc-in-progress')
    this.progress.classList.remove('godoc-in-progress')
  }

  setInProgress () {
    this.message.classList.add('godoc-in-progress')
    this.progress.classList.add('godoc-in-progress')
  }

  // TODO: function to add godoc-active class to editor, (and remove)
  // (then we can register for core:cancel command only when this class is present)

  static create () {
    return document.createElement('godoc-view')
  }
}

document.registerElement('godoc-view', {
  prototype: GodocView.prototype
})

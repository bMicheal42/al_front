/*
 * there is patched version of sortablejs Swap plugin (from 1.15.5 - latest for now)
 *
 * that patches fixes drag and drop logic of sortablejs and multi-drag plugin for project needs
 */

import sortablejs from 'sortablejs'
const { toggleClass, index } = sortablejs.utils

let lastSwapEl
let lastSwapIndex

function CustomActionHandlerPlugin() {
  function Swap() {
    this.defaults = {
      swapClass: 'sortable-swap-highlight'
    }
  }

  Swap.prototype = {
    dragStart({ dragEl }) {
      lastSwapEl = dragEl
    },
    dragOverValid({ completed, target, onMove, activeSortable, changed, cancel }) {
      if (!activeSortable.options.swap) return
      let el = this.sortable.el,
        options = this.options
      if (target && target !== el) {
        let prevSwapEl = lastSwapEl
        if (onMove(target) !== false) {
          toggleClass(target, options.swapClass, true)
          lastSwapEl = target
        } else {
          lastSwapEl = null
        }

        if (prevSwapEl && prevSwapEl !== lastSwapEl) {
          toggleClass(prevSwapEl, options.swapClass, false)
        }
      }
      changed()

      completed(true)
      cancel()
    },
    drop({ activeSortable, putSortable, dragEl }) {
      if (dragEl.dataset.selected === 'true') {
        this.options.multiDragSelect(dragEl)
      } else {
        this.options.multiDragDeselect(dragEl)
      }

      let toSortable = (putSortable || this.sortable)
      let options = this.options
      lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false)
      if (lastSwapEl && (options.swap || putSortable && putSortable.options.swap)) {
        lastSwapIndex = index(lastSwapEl)
        if (dragEl !== lastSwapEl) {
          toSortable.captureAnimationState()
          if (toSortable !== activeSortable) activeSortable.captureAnimationState()

          toSortable.animateAll()
          if (toSortable !== activeSortable) activeSortable.animateAll()
        }
      }
    },
    nulling() {
      lastSwapEl = null
    }
  }

  return Object.assign(Swap, {
    pluginName: 'swap',
    eventProperties() {
      return {
        swapItem: lastSwapEl,
        swapIndex: lastSwapIndex
      }
    }
  })
}

export default CustomActionHandlerPlugin

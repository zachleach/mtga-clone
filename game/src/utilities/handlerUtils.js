/* utilities/handlerUtils.js */

/**
 * CREATES READ-ONLY VERSIONS OF THE DRAG AND DROP HANDLERS
 * MAINTAINS VISUAL FEEDBACK BUT PREVENTS ACTUAL STATE CHANGES
 * 
 * @param {Object} handlers - Original handler object from BoardState
 * @returns {Object} Modified handlers that prevent state changes
 */
export const createReadOnlyHandlers = (handlers) => {
  /* PREVENTS DEFAULT BEHAVIOR AND STOPS EVENT PROPAGATION */
  const nullHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  /* PRESERVE DRAG OVER FOR VISUAL FEEDBACK BUT PREVENT ACTUAL DROPS */
  return {
    drag_start: {
      cardstack: nullHandler,
      hand: nullHandler
    },
    drop: {
      cardstack: nullHandler,
      cardrow: nullHandler,
      hand: nullHandler,
      hand_container: nullHandler
    },
    /* MAINTAIN ORIGINAL DRAG OVER HANDLERS FOR VISUAL FEEDBACK */
    drag_over: handlers.drag_over
  }
}

/**
 * CREATES A SET OF DEBUG HANDLERS THAT LOG ALL DRAG AND DROP EVENTS
 * USEFUL FOR DEVELOPMENT AND TROUBLESHOOTING
 * 
 * @param {Object} handlers - Original handler object from BoardState
 * @returns {Object} Modified handlers that log all events
 */
export const createDebugHandlers = (handlers) => {
  const wrapWithLogging = (handlerName, originalHandler) => {
    return (...args) => {
      console.log(`${handlerName} called with:`, args)
      return originalHandler(...args)
    }
  }

  return {
    drag_start: Object.entries(handlers.drag_start).reduce((acc, [key, handler]) => ({
      ...acc,
      [key]: wrapWithLogging(`drag_start.${key}`, handler)
    }), {}),
    drop: Object.entries(handlers.drop).reduce((acc, [key, handler]) => ({
      ...acc,
      [key]: wrapWithLogging(`drop.${key}`, handler)
    }), {}),
    drag_over: Object.entries(handlers.drag_over).reduce((acc, [key, handler]) => ({
      ...acc,
      [key]: wrapWithLogging(`drag_over.${key}`, handler)
    }), {})
  }
}

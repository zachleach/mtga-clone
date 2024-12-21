/* CardOperations.jsx */
/**
 * Creates initial stack state with default cards.
 */
export const create_initial_stack = () => ({
  id: '0',
  cards: [
    { color: 'red' }, 
    { color: 'blue' }, 
    { color: 'green' }, 
    { color: 'yellow' }
  ]
})

/**
 * Generates unique stack identifier for a row.
 */
const get_unique_stack_id = (row_state) => {
  const used_ids = new Set(row_state.stacks.map(s => s.id))
  let new_id = 0
  while (used_ids.has(String(new_id))) new_id++
  return String(new_id)
}

/**
 * Creates a new stack and inserts it into the row's stack array.
 */
export const create_new_stack = (row_state, card, drop_x, row, get_stack_position) => {
  if (row_state.stacks.length === 0) {
    row_state.stacks.push({
      id: get_unique_stack_id(row_state),
      cards: [card]
    })
    return
  }

  const stack_positions = row_state.stacks
    .map(stack => ({
      stack,
      position: get_stack_position(row, stack.id)
    }))
    .filter(item => item.position !== null)

  const nearest = stack_positions.reduce((a, b) => 
    Math.abs(a.position.center - drop_x) < Math.abs(b.position.center - drop_x) ? a : b
  )

  const new_stack = {
    id: get_unique_stack_id(row_state),
    cards: [card]
  }

  const nearest_index = row_state.stacks.findIndex(s => s.id === nearest.stack.id)
  const insert_index = drop_x > nearest.position.center ? nearest_index + 1 : nearest_index
  row_state.stacks.splice(insert_index, 0, new_stack)
}

/**
 * Moves a card between stacks, handling both same-row and cross-row transfers.
 */
export const move_card = (source, target, get_row_state, get_row_setter, get_stack_position) => {
  const source_row = get_row_state(source.row)
  const source_setter = get_row_setter(source.row)
  const target_setter = get_row_setter(target.row)
  
  let moved_card = null

  source_setter(curr_state => {
    const updated_state = { ...curr_state }
    const source_stack = updated_state.stacks.find(s => s.id === source.stack_id)
    const [card] = source_stack.cards.splice(source.card_index, 1)
    moved_card = card

    if (source.row === target.row) {
      if (target.stack_id) {
        const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
        const insert_index = source.stack_id !== target.stack_id 
          ? target.card_index + 1 
          : target.card_index
        target_stack.cards.splice(insert_index, 0, card)
      } else {
        create_new_stack(updated_state, card, target.drop_x, target.row, get_stack_position)
      }
    }

    updated_state.stacks = updated_state.stacks.filter(s => s.cards.length > 0)
    return updated_state
  })

  if (source.row !== target.row) {
    setTimeout(() => {
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        if (target.stack_id) {
          const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
          target_stack.cards.splice(target.card_index + 1, 0, moved_card)
        } else {
          create_new_stack(updated_state, moved_card, target.drop_x, target.row, get_stack_position)
        }
        return updated_state
      })
    }, 0)
  }
}

/**
 * Moves a card from the hand to either a stack or a new stack in a row.
 */
export const move_card_from_hand = (source, target, set_hand, get_row_setter, get_stack_position) => {
  let moved_card = null

  set_hand(curr_state => {
    const updated_state = { ...curr_state }
    const [card] = updated_state.cards.splice(source.card_index, 1)
    moved_card = card
    return updated_state
  })

  setTimeout(() => {
    if (target.type === 'stack') {
      const target_setter = get_row_setter(target.row)
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
        target_stack.cards.splice(target.card_index + 1, 0, moved_card)
        return updated_state
      })
    } else if (target.type === 'row') {
      const target_setter = get_row_setter(target.row)
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        create_new_stack(updated_state, moved_card, target.drop_x, target.row, get_stack_position)
        return updated_state
      })
    }
  }, 0)
}

/**
 * Moves a card from a stack to the hand.
 */
export const move_card_to_hand = (source, target_index, get_row_setter, set_hand) => {
  const source_setter = get_row_setter(source.row)
  let moved_card = null

  source_setter(curr_state => {
    const updated_state = { ...curr_state }
    const source_stack = updated_state.stacks.find(s => s.id === source.stack_id)
    const [card] = source_stack.cards.splice(source.card_index, 1)
    moved_card = card

    updated_state.stacks = updated_state.stacks.filter(s => s.cards.length > 0)
    return updated_state
  })

  setTimeout(() => {
    set_hand(curr_state => {
      const updated_state = { ...curr_state }
      updated_state.cards.splice(target_index, 0, moved_card)
      return updated_state
    })
  }, 0)
}

/**
 * Reorders cards within the hand.
 */
export const move_card_within_hand = (source_index, target_index, set_hand) => {
  set_hand(curr_state => {
    const updated_state = { ...curr_state }
    const [card] = updated_state.cards.splice(source_index, 1)
    updated_state.cards.splice(target_index, 0, card)
    return updated_state
  })
}

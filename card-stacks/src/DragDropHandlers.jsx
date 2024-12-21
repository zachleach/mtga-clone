/* DragDropHandlers.jsx */
import { 
  move_card,
  move_card_from_hand,
  move_card_to_hand,
  move_card_within_hand
} from './CardOperations'

/**
 * Calculates the appropriate insertion index for a card dropped into the hand container.
 */
const calculate_hand_insert_position = (total_cards, drop_x) => {
  if (total_cards === 0) return 0

  const card_height = 200
  const card_width = card_height * 0.714
  const hand_density = 120

  /* calculate center position of hand container */
  const container_center = window.innerWidth / 2

  /* Calculate relative position from center */
  const relative_x = drop_x - container_center

  /* convert position to card index */
  const calculated_index = Math.round(relative_x / hand_density + (total_cards - 1) / 2)

  /* clamp index to valid range */
  return Math.max(0, Math.min(calculated_index, total_cards))
}

/**
 * Initializes and returns the drag/drop event handler system.
 */
export const initialize_handlers = ({
  get_row_state,
  get_row_setter,
  get_stack_position,
  set_hand
}) => ({
  /* DRAG START */
  drag_start: {
    cardstack: (e, row, stack_id, card_index) => {
      e.dataTransfer.setData('source', JSON.stringify({
        type: 'stack',
        row,
        stack_id,
        card_index
      }))
    },
    hand: (e, card_index) => {
      e.dataTransfer.setData('source', JSON.stringify({
        type: 'hand',
        card_index
      }))
    }
  },

  /* DROP EVENTS */
  drop: {
    cardstack: (e, target_row, target_stack_id, target_index) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'stack') {
        move_card(source, {
          row: target_row,
          stack_id: target_stack_id,
          card_index: target_index
        }, get_row_state, get_row_setter, get_stack_position)
      } else if (source.type === 'hand') {
        move_card_from_hand({
          card_index: source.card_index
        }, {
          type: 'stack',
          row: target_row,
          stack_id: target_stack_id,
          card_index: target_index
        }, set_hand, get_row_setter, get_stack_position)
      }
    },

    cardrow: (e, target_row) => {
      e.preventDefault()
      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'stack') {
        move_card(source, {
          row: target_row,
          stack_id: null,
          drop_x: e.clientX
        }, get_row_state, get_row_setter, get_stack_position)
      } else if (source.type === 'hand') {
        move_card_from_hand({
          card_index: source.card_index
        }, {
          type: 'row',
          row: target_row,
          drop_x: e.clientX
        }, set_hand, get_row_setter, get_stack_position)
      }
    },

    hand: (e, target_index) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'hand') {
        move_card_within_hand(source.card_index, target_index, set_hand)
      } else if (source.type === 'stack') {
        move_card_to_hand(source, target_index, get_row_setter, set_hand)
      }
    },

    hand_container: (e, total_cards, drop_x) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      const insert_index = calculate_hand_insert_position(total_cards, drop_x)

      if (source.type === 'hand') {
        move_card_within_hand(source.card_index, insert_index, set_hand)
      } else if (source.type === 'stack') {
        move_card_to_hand(source, insert_index, get_row_setter, set_hand)
      }
    },
  },

  /* DRAG OVER */
  drag_over: {
    cardstack: (e) => {
      e.preventDefault()
      e.stopPropagation()
    },

    cardrow: (e) => {
      e.preventDefault()
    },

    hand: (e) => {
      e.preventDefault()
      e.stopPropagation()
    },

    hand_container: (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
  }
})

/* components/CardRow.jsx */
import React from 'react'
import { useBoardState } from '../providers/BoardState'
import CardStack from './CardStack'

/**
 * CONTAINER COMPONENT FOR A ROW OF CARD STACKS
 * SUPPORTS BOTH VERTICAL AND HORIZONTAL POSITIONING BASED ON ROW_POSITION
 * MAINTAINS CONSISTENT HEIGHT AND SPACING OF STACKS WITHIN ROW
 *
 * @param {Object} props
 * @param {Object} props.row - Row state object containing stack data
 * @param {string} props.row_position - Identifier for row position ('top', 'left', 'right')
 */
const CardRow = ({ row, row_position }) => {
  const { handlers } = useBoardState()

  const get_container_style = () => {
    const base_style = {
      background: 'grey',
      border: '1px solid black',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    if (row_position === 'top') {
      return {
        ...base_style,
        height: '20%',
        width: '100%',
      }
    }
    return {
      ...base_style,
      height: '100%',
      width: '50%',
      flex: 1,
    }
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => handlers.drag_over.cardrow(e, row_position),
    onDrop: (e) => handlers.drop.cardrow(e, row_position),
  }

  return (
    <div style={get_container_style()} {...html5_dnd_attributes}>
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
          row={row_position}
          stack_id={stack.id}
        />
      ))}
    </div>
  )
}

export default CardRow

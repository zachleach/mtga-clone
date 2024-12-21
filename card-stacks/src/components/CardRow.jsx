/* components/CardRow.jsx */
import React from 'react'
import { useBoardState } from '../BoardContext'
import CardStack from './CardStack'

/**
 * Container component for a row of card stacks.
 * Uses explicit height and width parameters for flexible positioning.
 *
 * @param {Object} props
 * @param {Object} props.row - Row state object containing stack data
 * @param {string} props.row_position - Identifier for row position ('top', 'left', 'right')
 * @param {string} props.height - Height of the container (e.g., '50%', '100%')
 * @param {string} props.width - Width of the container (e.g., '50%', '100%')
 */
const CardRow = ({ row, row_position, height, width }) => {
  const { handlers } = useBoardState()

  const container_style = {
    background: 'grey',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height,
    width,
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => handlers.drag_over.cardrow(e, row_position),
    onDrop: (e) => handlers.drop.cardrow(e, row_position),
  }

  return (
    <div style={container_style} {...html5_dnd_attributes}>
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

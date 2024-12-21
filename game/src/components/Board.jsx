/* components/Board.jsx */
import React from 'react'
import { useBoardState } from '../providers/BoardState'
import CardRow from './CardRow'
import CardHand from './CardHand'

/**
 * MAIN LAYOUT COMPONENT ORGANIZING CARD ROWS IN A T-SHAPED ARRANGEMENT
 * TOP ROW SPANS FULL WIDTH, LEFT AND RIGHT ROWS ARE POSITIONED HORIZONTALLY
 * HAND REMAINS AT THE BOTTOM
 */
const Board = () => {
  const { rows } = useBoardState()
  const [top_row, left_row, right_row] = rows

  const container_style = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }

  const middle_section_style = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  }

  return (
    <div style={container_style}>
      <CardRow row={top_row} row_position="top" />
      <div style={middle_section_style}>
        <CardRow row={left_row} row_position="left" />
        <CardRow row={right_row} row_position="right" />
      </div>
      <CardHand />
    </div>
  )
}

export default Board

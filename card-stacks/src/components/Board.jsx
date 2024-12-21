/* components/Board.jsx */
import React from 'react'
import { useBoardState } from '../BoardContext'
import CardRow from './CardRow'
import CardHand from './CardHand'

/**
 * Main layout component organizing card rows in a T-shaped arrangement.
 * Top row spans full width, left and right rows are positioned horizontally,
 * and hand remains at the bottom.
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
    height: '25%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  }

  return (
    <div style={container_style}>
      <CardRow row={top_row} row_position="top" height="50%" width="100%" />
      <div style={middle_section_style}>
        <CardRow row={left_row} row_position="left" height="100%" width="50%" />
        <CardRow row={right_row} row_position="right" height="100%" width="50%" />
      </div>
      <CardHand />
    </div>
  )
}

export default Board

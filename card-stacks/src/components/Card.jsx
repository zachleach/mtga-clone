/* components/Card.jsx */
import React from 'react'

/**
 * Base visual component representing a single card.
 * Renders as a colored rectangle with rounded corners and border.
 * Used as the fundamental building block for stacks and hands.
 *
 * @param {Object} props
 * @param {string} props.color - Color to fill card background
 * @param {Object} [props.style] - Optional additional inline styles
 *
 * @example
 * <Card color="red" />
 * <Card color="blue" style={{ opacity: 0.5 }} />
 */
const Card = ({ color, style = {} }) => {
  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
    ...style
  }

  return (
    <div style={card_style}/>
  )
}

export default Card

/* components/Card.jsx */
import React from 'react'

/**
 * BASE VISUAL COMPONENT REPRESENTING A SINGLE CARD
 * RENDERS AS A COLORED RECTANGLE WITH ROUNDED CORNERS AND BORDER
 *
 * @param {Object} props
 * @param {string} props.color - Color to fill card background
 */
const Card = ({ color }) => {
  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return <div style={card_style}/>
}

export default Card

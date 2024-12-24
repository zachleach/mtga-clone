const Card = ({ card_art, container_height }) => {
  const ASPECT_RATIO = 745 / 1040

  const card_style = {
    height: '100%',
    aspectRatio: ASPECT_RATIO,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={card_style}>
      <img 
        src={card_art} 
        alt="Card" 
        style={img_style}
      />
    </div>
  )
}

export default Card

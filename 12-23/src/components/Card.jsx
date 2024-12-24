/* components/Card.jsx */

/**
 * can probably be combined with tile 
 * the only thing that changes is the aspect ratio
 */
const Card = ({ img_path, container_height }) => {

  const ASPECT_RATIO = 745 / 1040

  const card_style = {
    height: `100%`,
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
        src={img_path} 
        alt="Card" 
        style={img_style}
      />
    </div>
  )
}

export default Card

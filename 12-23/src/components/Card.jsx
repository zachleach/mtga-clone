/* components/Card.jsx */
const Card = ({ img_path, container_height }) => {

  /* Calculate height as percentage of container */
  const height_percentage = 0.95 /* 95% of container height */
  const calculated_height = container_height * height_percentage
  const ASPECT_RATIO = 745 / 1040

  const card_style = {
    height: `${calculated_height}px`,
    width: `${calculated_height * ASPECT_RATIO}px`,
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

/* components/Card.jsx */

const Card = ({ img_path }) => {
  const h = 300;  
  const ASPECT_RATIO = 745 / 1040;  

  const card_style = {
    height: `${h}px`,
    width: `${h * ASPECT_RATIO}px`,  
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

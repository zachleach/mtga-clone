/* components/Tile.jsx */

const Tile = ({ img_path }) => {
  const h = 200;  
  const ASPECT_RATIO = 626 / 457;  

  const card_style = {
    height: `${h}px`,
    width: `${h * ASPECT_RATIO}px`,  
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
		transform: 'rotate(8deg)'
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
        alt="Tile" 
        style={img_style}
      />
    </div>
  )
}

export default Tile

/* components/Tile.jsx */
export const Tile = ({ art_url }) => {
  const ASPECT_RATIO = 626 / 457

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
        src={art_url} 
        alt="Tile" 
        style={img_style}
      />
    </div>
  )
}

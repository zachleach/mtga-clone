/* components/Card.jsx */

/* event listeners in this component */
/* you'd need uuid for the card itself to report events */
/* does the card itself need the websocket to report events then ? */
/* then the stack would need it as well for stack related events */
/* then you have prop drilling */
/* you'd need this anyways for tapping */

export const Card = ({ art_url, aspect_ratio = 745 / 1040, outline, uuid }) => {

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
		outline: `${outline}`
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={container_style}>
      <img 
        src={art_url} 
        alt="Card.jsx failed to load img element" 
        style={img_style}
      />
    </div>
  )
}


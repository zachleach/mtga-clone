/* components/Row.jsx */
export const Row = ({ state }) => {

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 0 50%', 
    overflow: 'hidden'
  }

  return (
    <div style={container_style} >
			{state}
    </div>
  )
}


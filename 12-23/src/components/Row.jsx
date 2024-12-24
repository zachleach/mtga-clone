/* components/Row.jsx */
import { useState } from 'react'
import { Stack } from '.'

const Row = ({ variant = 'default' }) => {
  const getStackIds = () => {
    switch(variant) {
      case 'wide':
        return ['0', '1', '3' ]
      case 'narrow':
        return ['0']
      default:
        return ['0', '1', '2']
    }
  }

  const [stack_ids, set_stack_ids] = useState(getStackIds())

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: `${stack_ids.length} 0 auto`, 
    overflow: 'hidden'
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: null,
    onDrop: null,
    onDragOver: null
  })

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      {stack_ids.map(id => (
        <Stack key={id} stack_id={id} />
      ))}
    </div>
  )
}

export default Row

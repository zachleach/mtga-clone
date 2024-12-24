/* components/Row.jsx */
import { useState } from 'react'
import { Stack } from '.'
import { useUniqueId } from '../hooks'

const Row = () => {

	const gen_uuid_func = useUniqueId('stack')
  const [stack_ids, set_stack_ids] = useState([
		gen_uuid_func(),
		gen_uuid_func(),
	])

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: '1 0 auto', 
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

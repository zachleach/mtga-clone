/* components/Row.jsx */
import { useState } from 'react'
import { Stack } from '.'
import { useUniqueId } from '../hooks'

const Row = ({ init_data = null, use_cards = false }) => {
  const gen_uuid_func = useUniqueId('stack')
  const [stacks, set_stacks] = useState(() => {
    if (!init_data) return []
    return init_data.map(card => ({
      id: gen_uuid_func(),
      card: card
    }))
  })

  const remove_stack = (stack_id) => {
    set_stacks(prev_stacks => prev_stacks.filter(stack => stack.id !== stack_id))
  }

  const create_stack = (card_obj) => {
    const new_id = gen_uuid_func()
    set_stacks(prev_stacks => [...prev_stacks, { id: new_id, card: card_obj }])
  }

  const on_drop = (e) => {
    e.preventDefault()
    const dropped_data = JSON.parse(e.dataTransfer.getData('application/json'))
    create_stack(dropped_data.card)
  }

  const on_drag_over = (e) => {
    e.preventDefault()
  }

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: use_cards ? 'center': 'flex-start',
    flex: '1 0 auto', 
    overflow: 'hidden'
  }

  const html5_dnd_attributes = () => ({
    onDrop: (e) => on_drop(e),
    onDragOver: (e) => on_drag_over(e)
  })

  return (
    <div style={container_style} {...html5_dnd_attributes()}>
      {stacks.map((stack) => (
        <Stack 
          key={stack.id} 
          stack_id={stack.id} 
          self_destruct_func={remove_stack}
          init_card={stack.card}
          use_cards={use_cards}
        />
      ))}
    </div>
  )
}

export default Row

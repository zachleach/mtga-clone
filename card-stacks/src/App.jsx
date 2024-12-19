import {  useState } from 'react'
import './App.css'
import { ListenersProvider, useListeners } from './Listeners'



const Card = ({ color }) => {

  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return (
    <div style={card_style}/>
  )
}



/**
 * layout component that also handles drag/drop of cards to/from it 
 *
 */
const CardStack = ({ card_arr, row_id, stack_id }) => {

	const { listeners } = useListeners()

  const card_height = 140;
  const overlap = 0.15;
  const visible_height = card_height * overlap;
  

  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
		margin: `${card_height * 0.1}px`,
  };


  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })


	const on_drag_start = (e, index) => {
		e.dataTransfer.setData('sourceRowId', row_id)
		e.dataTransfer.setData('sourceStackId', stack_id)
		e.dataTransfer.setData('cardIndex', index.toString())
	}


	const on_drop = (e, index) => {
		e.preventDefault()
		e.stopPropagation()

		const source = {
			row_id: e.dataTransfer.getData('sourceRowId'),
			stack_id: e.dataTransfer.getData('sourceStackId'),
			card_index: e.dataTransfer.getData('cardIndex')
		}

		const target = {
			row_id: row_id,
			stack_id: stack_id,
			card_index: index
		}

		listeners.drop.cardstack_cardstack(source, target)
	}


	const on_drag_over = (e, index) => {
		e.preventDefault()
		e.stopPropagation()
	}


	const html5_dnd_attributes = (index) => ({
		draggable: true,
		onDragStart: (e) => on_drag_start(e, index),
		onDrop: (e) => on_drop(e, index),
		onDragOver: (e) => on_drag_over(e, index)
	})


  return (
    <div style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)} >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}



/**
 * renders an array of card arrays (stacks of cards)
 *
 */
const CardRow = ({ row }) => {

	const { listeners } = useListeners();

	const container_style = {
		height: '20%', 
		width: '100%', 
		background: 'grey',
		border: '1px solid black',
		boxSizing: 'border-box',

		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}

	const row_dnd_props = {
		onDragOver: (e) => e.preventDefault(),
		onDrop: (e) => dnd.card_row.onDrop(e, row.id),
	}

	const on_drop = (e, row_id) => {
		e.preventDefault()

		const src_row_id = e.dataTransfer.getData('sourceRowId');
		const src_stack_id = e.dataTransfer.getData('sourceStackId');
		const src_card_index = parseInt(e.dataTransfer.getData('cardIndex'));

		/* TODO */

	}

	const on_drag_over = (e, row_id) => {
		e.preventDefault()
	}

	const html5_dnd_attributes = (row_id) => ({
		onDragOver: (e) => on_drag_over(e, row_id),
		onDrop: (e) => on_drop(e, row_id),
	})


	/**
	 * rendering each cardstack and passing it row/stack information for drag and drop events
	 *
	 */
	return (
		/* handle dropping onto the row */
    <div style={container_style} {...html5_dnd_attributes(row.id)}>

			{/* render CardStack component for each stack in card_row_obj.stacks  */}
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
					row_id={row.id}
					stack_id={stack.id}
        />
      ))}
    </div>
  );
}








const Board = () => {
	const { rows } = useListeners()

	const container_style = {
		display: 'flex',  
		height: '100vh',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
	}

	return (
		<div style={container_style}>
			<CardRow 
				key={rows[0].id}
				row={rows[0]}
			/>
			<CardRow 
				key={rows[1].id}
				row={rows[1]}
			/>
		</div>
	)

}



const App = () => {
	return (
		<ListenersProvider>
			<Board/>
		</ListenersProvider>
  );
};





export default App

import { useState } from 'react';

export const use_drag_and_drop = (cards, set_cards) => {
  const [dragged_card, set_dragged_card] = useState(null);
  const [drag_over_index, set_drag_over_index] = useState(null);
  const [is_dragging, set_is_dragging] = useState(false);

  const handle_drag_start = (index) => (e) => {
    set_dragged_card(index);
    set_is_dragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handle_drag_over = (index) => (e) => {
    e.preventDefault();
    set_drag_over_index(index);
  };

  const handle_drop = (index) => (e) => {
    e.preventDefault();
    if (dragged_card === null) return;

    const new_cards = [...cards];
    const [dragged_item] = new_cards.splice(dragged_card, 1);
    new_cards.splice(index, 0, dragged_item);
    
    set_cards(new_cards);
    set_dragged_card(null);
    set_drag_over_index(null);
  };

  const handle_drag_end = () => {
    set_dragged_card(null);
    set_drag_over_index(null);
    set_is_dragging(false);
  };

  const drag_handlers = (index) => ({
    onDragStart: handle_drag_start(index),
    onDragOver: handle_drag_over(index),
    onDrop: handle_drop(index),
    onDragEnd: handle_drag_end
  });

  return {
    dragged_card,
    drag_over_index,
    is_dragging,
    drag_handlers
  };
};

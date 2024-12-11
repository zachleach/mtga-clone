import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

export const use_preview = (is_dragging, cards) => {
  const [preview_pos, set_preview_pos] = useState(null);
  const [preview_card, set_preview_card] = useState(null);

  const debounced_set_preview = useCallback(
    debounce((e, card_index) => {
      if (!e || is_dragging) {
        set_preview_pos(null);
        set_preview_card(null);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      set_preview_pos(rect.left + rect.width / 2);
      set_preview_card(cards[card_index]);
    }, 50),
    [is_dragging, cards]
  );

  const preview_handlers = (index) => ({
    onMouseMove: (e) => debounced_set_preview(e, index),
    onMouseLeave: () => debounced_set_preview(null)
  });

  return {
    preview_pos,
    preview_card,
    preview_handlers
  };
};

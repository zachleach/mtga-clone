export const Card = ({ index, total_cards, is_dragging, is_drag_over, image, drag_handlers, preview_handlers }) => {
  return (
    <div
      style={create_card_style(index, total_cards, is_dragging, is_drag_over)}
      draggable={true}
      {...drag_handlers}
      {...preview_handlers}
    >
      <img src={image} alt={`card ${index}`} style={card_image} />
    </div>
  );
};

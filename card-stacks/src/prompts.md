before responding to the following query, outline the task and its assumptions step-by-step

extend move_cards() in listeners.jsx to implement the following functionality

when a drop event onto cardrow triggers listeners.drop.cardrow() and calls move_cards(), move_cards() adds a new cardstack to the target card_row at a horizontal location depending on the mouse coordinate where the drop event occurred.  

specifically:
if there are no cardstacks on the target row, add that card to a new cardstack on the target row

if there are cardstacks on the target row, use get_stack_position() in listeners.jsx to compute each stack's center
find the cardstack with the nearest center to the where the mouse dropped the card
if the cursor is right of the nearest cardstack, place the card on a cardstack to the right of the nearest cardstack
if the cursor is left of the nearest cardstack, place the card on a cardstack to the left of the nearest cardstack



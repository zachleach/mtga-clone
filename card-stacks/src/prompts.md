before responding to the following query, outline the task and its assumptions step-by-step

extend move_cards() in listeners.jsx to implement the following functionality

when a drop event onto cardrow triggers listeners.drop.cardrow() and calls move_cards(), move_cards() adds a new cardstack to the target card_row at a horizontal location depending on the mouse coordinate where the drop event occurred.  

specifically:
if there are no cardstacks on the target row, add that card to a new cardstack on the target row

if there are cardstacks on the target row, use get_stack_position() in listeners.jsx to compute each stack's center
find the cardstack with the nearest center to the where the mouse dropped the card
if the cursor is right of the nearest cardstack, place the card on a cardstack to the right of the nearest cardstack
if the cursor is left of the nearest cardstack, place the card on a cardstack to the left of the nearest cardstack



---

before responding to this query, explain its background assumptions, its intention, and then provide a high level step-by-step approach for implementing the changes with brief justification as to why you chose to do each thing you did.  

i've uploaded two distinct react projects, one involving a cardhand component (CardHand.jsx), the other involving cardstacks and cardrows with drag and drop functionality (App.jsx and Listeners.jsx)

first i hacked togeher CardHand.jsx using bad design, then i improved substantially in the second project 
now i'm going back to cardhand and am trying to extract the core functionality so that i can add that to the second project

specifically, i'm trying to create a new component analagous to CardStack in App.jsx called 'CardFan' that will be nested in a new component analagous to CardRow called 'CardHand'

CardFan should be able to render a row of cards using similar card positioning styling (e.g., card_style function in CardHand.jsx).  additionally, it should keep all of its html5 drag and drop functionality where you can drag and drop cards within the cardfan -- with the key exception that you shouldn't be able to create multiple stacks (fans) in the cardrow

CardHand should wrap the cardfan in the same way that CardRow wraps CardStack, and should 

the main thing when implementing is to maintain





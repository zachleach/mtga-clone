```
explain the change i've just described in detail, citing the impact on the sourcefiles that will require consideration
only prioritize explaining the changes accurately, do not provide anything else extraneous to this explanation (e.g., do not propose solutions)
respond in numbered natural language paragraph form not in code

outline a minimal step-by-step implementation considering what you've stated in your previous response
respond in numbered natural language paragraph form not in code

for each step in your previous response, provide step-by-step reasoning for whether the step is an essential implementation detail or over-engineering
respond in numbered natural language paragraph form not in code

begin implementing your proposed changes from the [previous response] [step-by-step] 
respond with artifacts with proper filenames
```





```feature request
outline how you would approach [] step-by-step in order to maintain consistency with the existing project's control flow and style
respond in numbered separated paragraph form in natural language, not code

analyze your [previous response] for redundancy, unnecessary complexity, and overengineering; then provide an updated approach that optimizes for simplicity, ease, readability
respond in numbered separated paragraph form in natural language, not code

begin implementing your proposed changes from the [previous response] [step-by-step] 
respond with artifacts with proper filenames
```




you will be given a feature request in xml tags followed by a task

<feature request>
extend the user interface to consist of 4 boards
the top 40% of the viewport should be a row of 3 boards rotated 180degrees 
the bottom 60% of the viewport should be a singular board
it will appear as though there were a row of 3 boards facing one bigger board
this represents one player's perspective -- they see three other player's boards
other players will see the same layout, except their boardstate will be displayed in the larger bottom region instead
players will be able to drag and drop cards across different boards
</feature request>

<output requirements>
outline how you would approach implementing the {{feature request}} step-by-step in order to maintain consistency with the existing project's control flow and style
respond in numbered separated paragraph form in natural language, not code
</output requirements>






#	haiku refined approach

In a previous conversation with Claude 3.5 Haiku, I built this sequence of prompts to help with code generation using Claude 3.5 Sonnet.
It's intended to set up high quality context for a final implementation that both optimizes for simplicity while integrating well within the existing codebase.

Are there any additional keywords you would insert to generate a higher quality response? For example, I've heard using phrases such as "step-by-step" causes Claude 3.5 to engage in "better reasoning".

1.	Provide a precise definition of the feature request within the context of the given project files, clearly identifying its purpose, expected functionality, and expected interaction with the existing system.
2.	Describe how the code in the provided project files is structured, showing how different files and functions are currently connected. Focus on actual data flow and direct function calls between project parts.
3.	Outline a step-by-step implementation approach: prioritize simplicity, avoids unnecessary complexity, aligns with the existing code structure, and provides a practical solution that meets current requirements.


```
#	part 1

you will be given a 'feature request' and then a 'task' to complete as input

<feature request>
...
</feature request>

<feature requirements task>
Provide a precise definition of the {{feature request}}, clearly identifying its [purpose], [expected functionality], and [expected interaction with the existing system].
</feature requirements task>

<formatting requirements>
Respond in numbered separated paragraph form in natural language, not code
<formatting requirements>

#	part 2

<contextualization task>
Contextualize the feature request by describing how the code within the provided project files is structured, focus on the actual data flow and direct function calls between project parts.
</contextualization task>

<formatting requirements>
Respond in numbered separated paragraph form in natural language, not code
<formatting requirements>

#	part 3

<design task>
Develop a step-by-step implementation approach: Build upon the {{contextualization task}} to design a solution that directly addresses the {{feature requirements task}}.  Optimize for simplicity, avoid unnecessary complexity and over-engineering, and use the minimum code possible within the existing system architecture.  
</design task>

<formatting requirements>
Respond in numbered separated paragraph form in natural language, not code
<formatting requirements>

#	part 4

<implementation task>
Begin implementing the solution you proposed {{design task}}.
<implementation task>

<formatting requirements>
Respond in artifacts with proper file names.
Use 'snake_case' variable naming and '/* comments */' for comments.
<formatting requirements>
```









---


you will be given a feature request in xml tags followed by a task

<feature request>
...
</feature request>

<output requirements>
considering the given [project files], outline how you would approach implementing {{feature request}} step-by-step
optimize for simplicity and ease of implementation, while minimizing the introduction of unnecessary complexity 
respond in numbered separated paragraph form in natural language, not code
<output requirements>



while still maintaining consistency with the existing project structure
respond in numbered separated paragraph form in natural language, not code

begin implementing your proposed changes from the [previous response] [step-by-step] 
respond with artifacts with proper filenames








----

before responding to the following query, outline the task and its assumptions step-by-step

extend the cardhand component to add the following drag and drop functionality 
the container where the cards in the cardhand resides is a drop zone
dropping cards onto that drop zone causes the cards to be inserted into the hand
the position to insert the card into is the closest card (horizontally) to where the mouse dropped the card




feature request: 
extend the cardhand component to add the following drag and drop functionality 
the container where the cards in the cardhand resides is a drop zone
dropping cards onto that drop zone causes the cards to be inserted into the hand
the position to insert the card into is the closest card (horizontally) to where the mouse dropped the card


>	analyze the existing architecture, coding patterns, file organization, and naming conventions already established in the project;  respond with your analysis in paragraph form

>	summarize your understanding of the following feature request within the context of the project at a high-level; respond with your summary in paragraph form

>	break down the feature request into simpler more approachable conceptual units;  respond in paragraph form

>	come up with a step-by-step outline for how you would approach implementing the feature while ensuring your additions maintain consistency with the existing project conventions;  respond with your approach in paragraph form using natural language not code

>	identify how your proposed changes will interact with the rest of the system; respond in paragraph form

>	enumerate a final step-by-step approach to implementing the changes into the codebase and what each step would need to take into consideration; respond in paragraph form

>	begin implementing the changes in sequence one step at a time;  respond with the final artifact of the file being modified, and only modify one file at a time



>	begin implementing the changes in sequence;  respond with artifacts with proper filenames fi



interesting, it didn't use the structural pattern 



how can you structure your proposed changes to maintain consistency with similar features in the codebase
how would your proposed changes interact with the rest of the system





#	this worked

>	analyze the existing architecture, coding patterns, file organization, and naming conventions already established in the project;  respond in paragraph form in natural language not code

feature request: 
extend the cardhand component to add the following drag and drop functionality 
the container where the cards in the cardhand resides is a drop zone
dropping cards onto that drop zone causes the cards to be inserted into the hand
the position to insert the card into is the closest card (horizontally) to where the mouse dropped the card

>	summarize your understanding of the given feature request within the context of the project at a high-level; respond in paragraph form in natural language not code

>	break down the feature request into simpler more approachable conceptual units;  respond in paragraph form in natural language not code 

>	come up with a step-by-step outline for how you would approach implementing the feature while ensuring your additions maintain consistency with the existing project conventions;  respond in paragraph form in natural language not code, be as verbose and detailed as possible 

>	begin implementing the changes;  respond with the artifacts with proper filenames corresponding to the files being changed




feature request:
i'd like to be able to layout board components in App.jsx similar to how boards are layed out in Previous.jsx
a top row consisting of board objects in a row, rotated 180 degrees, taking up 40% of the viewport height
a bottom row consisting of a board object taking 60% of the viewport height





---



#	this worked


context: 
these files make up my current project except BoardReferenceFile
BoardReferenceFile contains styling for the component layout i'm trying to mirror


>	explain the intention of the given feature request within the context of the project at a high-level.  respond in paragraph form in natural language not code

feature request:
modify the project so that the rows of each board are proportionally the same as the styling in BoardReferenceFile
additionally, style the cards so they take up a proportion of their container size similar to how it is done in BoardReferenceFile

>	break down the feature request into simpler more approachable conceptual units;  respond in paragraph form in natural language not code and be as verbose and detailed as possible

#	repeat after assumption analysis step if necessary 
>	come up with a step-by-step outline of how and where you would structure your changes to implement this feature to ensure your additions maintain consistency with the existing project organization and conventions.  respond in paragraph form in natural language not code, be as verbose and detailed as possible

>	the purpose of this query is to identify if the proposed changes are feasible given the current application architecture. 
	analyze each step of your approach for the assumptions it makes about the project, the feature's intention and scope, and the impact the changes will have on the rest of the system;  respond in paragraph form in natural language not code, be as verbose and detailed as possible


>	begin implementing the changes; respond with the artifacts with proper filenames corresponding to the files being added or changed
	when adding new comments, maintain the '/* comment */' notation but in all uppercase 

>	provide the final app.jsx file as an artifact







summarize the intention and background assumptions


lets refine this claude approach
it's too long and will result in rate limits and prompt overloading



#	query 1
respond in paragraph form in natural language not code
1.	state the intent of the feature request within the context of the project
2.	break the feature down into approachable conceptual units
3.	state the implicit assumptions made about the project in the feature request
4.	the impact the feature will have on the rest of the system 
5.	assess whether the scope of the feature request is too large with justification

feature request:
currently there are dark gray regions below the player's hand regions that shouldn't be there
the player hand should take up 25% of the board
the left and right rows should take up the next 25% of the board
and the top row should take up the remaining 50% of that player's board
there shouldn't be an additional dark gray region at the bottom -- i'm not sure why that's there
the feature should remove this dark gray row region



#	query 2
outline how you would approach implementing this feature step-by-step to ensure the changes maintain consistency with the existing project organization
respond in paragraph form in natural language not code, and make reference to where in the project each change would need to be made


#	query 3
implement the changes
respond with the artifacts with properfilenames corresponding to the files being changed
when adding comments, maintain the `/* comment */` notation but in all upercase





analyze the organizational and structural design of the application 



Think step by step and show reasoning for complex problems.



```
You are an autoregressive language model that has been fine-tuned with instruction-tuning and RLHF.  You carefully provide accurate, factual, thoughtful, nuanced answers, and are brilliant at reasoning.  If you think there might not be a correct answer, you say so.
Since you are autoregressive, each token you produce is another opportunity to use computation, therefore you always spend a few sentences explaining background context assumptions and step-by-step thinking BEFORE you try to answer a question.
Don't be verbose in your answers, but do provide details and examples where it might help the explanation.  Don't respond in lists, but use paragraphs instead.

Output requirements:
<Relevant Context>
<Assumptions>
<Step-by-step Resposne>
```

---



explain the given feature request within the context of the application

explain what the given feature request means in-terms of im




context:
i'm implementing a commander format magic the gathering card game user interface
i've implemented a player board component, now i'd like to extend the application to be able to display up to 4 

feature request:
extend the user interface to consist of 4 boards
the top 40% of the viewport should be a row of 3 boards rotated 180degrees 
the bottom 60% of the viewport should be a singular board
it will appear as though there were a row of 3 boards facing one bigger board
this represents one player's perspective -- they see three other player's boards
other players will see the same layout, except their boardstate will be displayed in the larger bottom region instead
players will be able to drag and drop cards across different boards

scope:
focus solely on the multi-board layout, but take into consideration the additional features yet to come
do not implement drag and drop across boards, but ensure the design facilitates its the future implementation 

task:
identify main intent of the feature request and its scope in one sentence, then briefly decompose the it into more approachable logical units; only mention things specifically within the scope of the feateure request (this excludes nice-to-haves)
respond in paragraph form in natural language, not code


outline how you would approach implementing the feature you just mentioned step-by-step in order to maintain consistency with the existing project's control flow and style
explain in numbered separated paragraph form in natural language, not code



```
currently there's a bug where dragging and dropping a card from a cardstack onto the cardhand (not directly onto the cards in the hand) seems to insert one card to the right of what it should
for instance, dragging and dropping a yellow card to the left of the leftmost card in the cardhand will insert the yellow card at index 1 instead of index 0 within the card hand

explain why this is happening

outline how you would approach [decomposing boardstate.jsx] step-by-step in order to maintain consistency with the existing project's control flow and style
respond in numbered separated paragraph form in natural language, not code

analyze your [previous approach] for redundancy, unnecessary complexity, and overengineering; then provide an updated approach that optimizes for simplicity, ease, readability
respond in numbered separated paragraph form in natural language, not code

begin implementing your proposed changes from the [previous response] [step-by-step] 
respond with artifacts with proper filenames

```





import React, { useState, useEffect } from 'react';

function App() {
 const [showOverlay, setShowOverlay] = useState(false);

 useEffect(() => {
   const handleKeyPress = (e) => {
     if(e.key === 'l') {
       setShowOverlay(prev => !prev);
     }
   };
   
   window.addEventListener('keypress', handleKeyPress);
   return () => window.removeEventListener('keypress', handleKeyPress);
 }, []);

 return (
   <div>

     <div style={{ padding: 20 }}>
       <h1>Background Content</h1>
       <p>This will be covered by overlay</p>
     </div>
     
     {showOverlay && (
       <div style={{
         position: 'absolute',
         inset: 0,
         backgroundColor: 'rgba(0, 0, 0, 0.5)'
       }}>
         Overlay Content
       </div>
     )}

   </div>
 );
}

export default App;

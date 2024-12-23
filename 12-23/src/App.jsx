/* App.jsx */

import './App.css'
import { useState, useEffect, useRef } from 'react'
import { Board, Hand, Row } from './components'

const App = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

			{/* 30% row height */}
			<div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'column', border: '1pt solid yellow', overflow: 'hidden' }}>
				
				{/* flex row wrapper */}
				<div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'row', overflow: 'hidden' }}>


					{/* OPPONENT 1 */}
					<div style={{ display: 'flex', flex: '0 0 33.33%', flexDirection: 'column', border: '1pt solid red',  }}>
						{/* Hand */}
						<div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow', minHeight: '20%'  }}>
							Hand
						</div>

						{/* Non-Creatures */}
						<div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row', minHeight: '30%' }}>
							<Row />
							<Row />
						</div>

						{/* Creatures */}
						<div style={{ display: 'flex', flex: '0 0 50%', minHeight: '50%'}}>
							<Row />
						</div>
					</div>


					{/* OPPONENT 2 */}
					<div style={{ display: 'flex', flex: '0 0 33.33%', flexDirection: 'column', border: '1pt solid red',   }}>
						{/* Hand */}
						<div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow',  minHeight: '20%'}}>
							Hand
						</div>

						{/* Non-Creatures */}
						<div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row' }}>
							<Row />
							<Row />
						</div>

						{/* Creatures */}
						<div style={{ display: 'flex', flex: '0 0 50%', minHeight: '50%' }}>
							<Row />
						</div>
					</div>


					{/* OPPONENT 3 */}
					<div style={{ display: 'flex', flex: '0 0 33.33%', flexDirection: 'column', border: '1pt solid red', }}>

						{/* Hand */}
						<div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow',  }}>
							Hand
						</div>

						{/* Non-Creatures */}
						<div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row',  }}>
							<Row />
							<Row />
						</div>

						{/* Creatures */}
						<div style={{ display: 'flex', flex: '0 0 50%', }}>
							<Row />
						</div>

					</div>
				</div>
			</div>


			{/* 70% row height */}
			<div style={{ display: 'flex', flex: '0 0 70%', flexDirection: 'column', border: '1pt solid red', overflow: 'hidden',  }}>

				{/* Creatures */}
				<div style={{ display: 'flex', flex: '0 0 50%', minHeight: '50%' }}>
					<Row />
				</div>

				{/* Non-Creatures */}
				<div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row', minHeight: '30%' }}>
					<Row />
					<Row />
				</div>

				{/* Hand */}
				<div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow',  minHeight: '20%'}}>
					Hand
				</div>

			</div>


    </div>
  )
}

export default App

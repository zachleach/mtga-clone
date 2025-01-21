import { createContext, useRef } from 'react'

export const Client = createContext(null)

export const ClientProvider = ({ children }) => {

	/* why does this need to be a ref, why can't it just be a variable */
	/* just to be safe i guess */
	const ref_map = useRef(new Map())

	const register_ref = (uuid, ele) => {
		console.log(uuid, ele)
		if (ele) {
			ref_map.current.set(uuid, ele)
		}
		else {
			ref_map.current.delete(uuid)
		}
	}

	const value = {
		register_ref,
		get_ref: (uuid) => ref_map.current.get(uuid)
	}

	return (
		<Client.Provider value={value}>
			{children}
		</Client.Provider>
	)
}

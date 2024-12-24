import { useRef } from 'react'

const useUniqueId = (prefix = 'stack') => {
  const counter = useRef(0)
  
  const generate_id = () => {
    counter.current += 1
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 5)
    return `${prefix}_${timestamp}_${random}_${counter.current}`
  }
  
  return generate_id
}

export default useUniqueId

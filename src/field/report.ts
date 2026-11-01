import { createContext, useContext } from 'react'

// A control's own problem (a phone number too short), shown by its Field while
// it has no `error`; null clears it.
export const FieldReport = createContext<((problem: string | null) => void) | null>(null)

export const useFieldReport = () => useContext(FieldReport)

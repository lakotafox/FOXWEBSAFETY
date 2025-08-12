"use client"

import React, { createContext, useContext } from 'react'
import { useCarrieEditor } from '../hooks/useCarrieEditor'

// Define the context type based on the useCarrieEditor return type
type EditorContextType = ReturnType<typeof useCarrieEditor>

const EditorContext = createContext<EditorContextType | null>(null)

interface EditorProviderProps {
  children: React.ReactNode
}

export function EditorProvider({ children }: EditorProviderProps) {
  const editorData = useCarrieEditor()
  
  return (
    <EditorContext.Provider value={editorData}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return context
}
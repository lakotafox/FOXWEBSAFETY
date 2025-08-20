'use client'

import { KeyboardEvent } from 'react'

interface EditableFieldProps {
  value: string
  isEditing: boolean
  onStartEdit: () => void
  onEndEdit: () => void
  onChange: (value: string) => void
  type?: 'text' | 'textarea'
  className?: {
    display?: string
    input?: string
  }
  placeholder?: string
  rows?: number
}

export default function EditableField({
  value,
  isEditing,
  onStartEdit,
  onEndEdit,
  onChange,
  type = 'text',
  className = {},
  placeholder,
  rows = 2
}: EditableFieldProps) {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && type === 'text') {
      onEndEdit()
    }
  }

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onEndEdit}
          className={className.input || "w-full p-1 border rounded"}
          rows={rows}
          placeholder={placeholder}
          autoFocus
        />
      )
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEndEdit}
        onKeyPress={handleKeyPress}
        className={className.input || "w-full p-1 border rounded bg-white text-black"}
        placeholder={placeholder}
        autoFocus
      />
    )
  }

  return (
    <div 
      onClick={onStartEdit}
      className={className.display || "cursor-pointer hover:text-red-600"}
    >
      {value}
    </div>
  )
}
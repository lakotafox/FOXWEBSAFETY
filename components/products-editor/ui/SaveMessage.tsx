'use client'

interface SaveMessageProps {
  show: boolean
  message?: string
}

export default function SaveMessage({ show, message }: SaveMessageProps) {
  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
      {message || 'Changes saved!'}
    </div>
  )
}
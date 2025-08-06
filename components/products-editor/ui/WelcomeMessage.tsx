'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WelcomeMessageProps {
  show: boolean
  onClose: () => void
}

export default function WelcomeMessage({ show, onClose }: WelcomeMessageProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <h2 className="text-3xl font-black mb-6 text-center">HEY DAD!</h2>
          <div className="space-y-4 text-lg">
            <p>
              Please test this "product editing page". You can see the live page at{' '}
              <a 
                href="https://foxbuiltstore.com/products" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-bold"
              >
                https://foxbuiltstore.com/products
              </a>
            </p>
            <p>
              For now that page should be secret.. but this editor should update the page https://foxbuiltstore.com/products
            </p>
            <p>
              Test it out lmk... and when its all ready to go we can add a button on the main page that goes to the finished product page.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3"
            >
              GOT IT!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
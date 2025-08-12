'use client'

import { Button } from '@/components/ui/button'
import RocketButton from '@/components/ui/RocketButton'
import StoreHours from '@/components/ui/StoreHours'
import { useContactForm } from './hooks/useContactForm'

export default function ContactForm() {
  const { formData, isSubmitting, handleFormChange, handleFormSubmit } = useContactForm()

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center text-white mb-16 tracking-tight">
          CONTACT US
        </h2>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <div>
            <StoreHours className="mt-12" />
          </div>

          <div>
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="NAME"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="EMAIL / PHONE *"
                  required
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="TELL US WHAT YOU NEED"
                  rows={1}
                  value={formData.message}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-4 font-black text-lg tracking-widest border-4 border-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? "SENDING..." : "SEND A MESSAGE"}
                </Button>
                <RocketButton />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
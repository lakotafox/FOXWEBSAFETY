'use client'

import { Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center mb-16 tracking-tight">
          GET IN <span className="text-red-500">TOUCH</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <div>
            <h3 className="text-3xl font-black mb-8 tracking-wide">CONTACT INFO</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-semibold">CALL US</p>
                  <p className="text-xl font-black">(801) 899-9406</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-semibold">EMAIL US</p>
                  <p className="text-xl font-black">info@foxbuilt.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-semibold">VISIT US</p>
                  <p className="text-lg font-black">420 W Commerce Dr Building LL</p>
                  <p className="text-lg font-black">Pleasant Grove, UT 84062</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-black mb-8 tracking-wide">SEND A MESSAGE</h3>
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 text-white placeholder-zinc-400 font-bold"
              />
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 border-4 border-red-500">
                SEND A MESSAGE
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
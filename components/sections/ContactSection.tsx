'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import RocketButton from '@/components/ui/RocketButton'
import StoreHours from '@/components/ui/StoreHours'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      alert("Please enter your email")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // For now, just log the form data
      console.log('Form submission:', formData)
      
      // Load EmailJS dynamically only when needed
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      document.body.appendChild(script)
      
      script.onload = async () => {
        try {
          // Initialize EmailJS
          window.emailjs.init('0Bkb_97n0e_1HsPH9')
          
          // Send email
          const response = await window.emailjs.send('service_i32u95o', 'template_ocnmsya', {
            from_name: formData.name || 'Website Visitor',
            from_email: formData.email,
            phone: formData.phone || 'Not provided',
            message: formData.message || 'No message provided',
            to_email: 'kylefox@foxbuilt.com',
            // Additional fields for context
            source: 'Website Contact Form',
            timestamp: new Date().toISOString()
          }, '0Bkb_97n0e_1HsPH9')
          
          console.log('Email sent successfully:', response)
          alert("Thanks! Your quote request has been sent. We'll get back to you soon!")
          
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: ""
          })
        } catch (emailError) {
          console.error('EmailJS error:', emailError)
          alert("Error sending email. Please try again or call us at (801) 899-9406")
        }
      }
      
      script.onerror = () => {
        alert("Error loading email service. Please try again or call us at (801) 899-9406")
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      alert("Error submitting form. Please try again or call us at (801) 899-9406")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
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
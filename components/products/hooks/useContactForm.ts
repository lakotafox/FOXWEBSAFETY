'use client'

import { useState } from 'react'

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

export function useContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // EmailJS configuration
      const EMAILJS_SERVICE_ID = "service_axmx4b8"
      const EMAILJS_TEMPLATE_ID = "template_r90th68"
      const EMAILJS_PUBLIC_KEY = "_C1u7k95AKuGRXqea"

      // Load EmailJS script dynamically
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      document.head.appendChild(script)
      
      script.onload = async () => {
        try {
          // @ts-ignore
          window.emailjs.init(EMAILJS_PUBLIC_KEY)
          
          // Send email
          // @ts-ignore
          const response = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message
          })
          
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

  return {
    formData,
    isSubmitting,
    handleFormChange,
    handleFormSubmit
  }
}
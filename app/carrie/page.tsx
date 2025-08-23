"use client"

import Image from "next/image"
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import AdminControls from '@/components/carrie/ui/AdminControls'
import HelpModal from '@/components/ui/HelpModal'
import PublishConfirmation from '@/components/carrie/ui/PublishConfirmation'
// Gallery editor removed - no longer needed
import AuthenticationWrapper from '@/components/carrie/AuthenticationWrapper'
import SectionManager from '@/components/carrie/SectionManager'
import { EditorProvider, useEditorContext } from '@/components/carrie/providers/EditorProvider'


export default function AdminEditor() {
  return (
    <EditorProvider>
      <MainEditor />
    </EditorProvider>
  )
}

function MainEditor() {
  const {
    isAuthenticated,
    showPageSelection,
    showPasswordScreen,
    password,
    setIsAuthenticated,
    setShowPageSelection,
    setShowPasswordScreen,
    setPassword
  } = useEditorContext()

  return (
    <AuthenticationWrapper
      isAuthenticated={isAuthenticated}
      showPageSelection={showPageSelection}
      showPasswordScreen={showPasswordScreen}
      password={password}
      setIsAuthenticated={setIsAuthenticated}
      setShowPageSelection={setShowPageSelection}
      setShowPasswordScreen={setShowPasswordScreen}
      setPassword={setPassword}
    >
      <div className="min-h-screen bg-zinc-100">
        <EditorContent />
      </div>
    </AuthenticationWrapper>
  )
}

function EditorContent() {
  const { 
    saveMessage,
    showLoadingOverlay,
    showPublishLoadingOverlay,
    publishMessage,
    showPublishConfirm,
    setShowPublishConfirm,
    showHelp,
    setShowHelp,
    saveAllChanges,
    getImageUrl
  } = useEditorContext()

  return (
    <>
      <LoadingOverlay show={showLoadingOverlay} type="default" />
      <LoadingOverlay show={showPublishLoadingOverlay} type="publish" publishMessage={publishMessage} />
      
      <AdminControls onPublish={saveAllChanges} />
      
      {/* Save message */}
      {saveMessage && (
        <div className="fixed top-0 left-0 right-0 z-[59] bg-green-500 text-white p-4 text-center font-bold">
          {saveMessage}
        </div>
      )}

      {/* Main site content with edit capability */}
      <SectionManager />

      {/* Gallery editor removed - no longer on public page */}

      <PublishConfirmation 
        show={showPublishConfirm} 
        onConfirm={() => window.location.href = '/'}
        onCancel={() => setShowPublishConfirm(false)}
      />

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-8 left-8 w-16 h-16 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
        style={{ position: 'fixed' }}
      >
        <Image
          src="/icons/questionmark.png"
          alt="Help"
          width={64}
          height={64}
          className="drop-shadow-lg hover:drop-shadow-xl transition-all"
        />
      </button>

      <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}
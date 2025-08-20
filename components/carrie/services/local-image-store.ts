// Store for pending image uploads that will be uploaded on publish
interface PendingImage {
  fileName: string
  base64Content: string
  path: string
}

class LocalImageStore {
  private pendingImages: Map<string, PendingImage> = new Map()
  
  // Add an image to pending uploads
  addPendingImage(fileName: string, base64Content: string) {
    const path = `public/images/${fileName}`
    this.pendingImages.set(fileName, {
      fileName,
      base64Content,
      path
    })
  }
  
  // Get all pending images
  getPendingImages(): PendingImage[] {
    return Array.from(this.pendingImages.values())
  }
  
  // Clear pending images after successful publish
  clearPendingImages() {
    this.pendingImages.clear()
  }
  
  // Remove a specific pending image
  removePendingImage(fileName: string) {
    this.pendingImages.delete(fileName)
  }
  
  // Check if there are pending images
  hasPendingImages(): boolean {
    return this.pendingImages.size > 0
  }
}

// Export singleton instance
export const imageStore = new LocalImageStore()
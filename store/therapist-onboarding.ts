import { create } from 'zustand'
import type { StoredDocument } from '@/types/therapist'

type OnboardingDocumentsState = {
  licenseFile: StoredDocument | null
  identityFile: StoredDocument | null
  setLicenseFile: (file: StoredDocument | null) => void
  setIdentityFile: (file: StoredDocument | null) => void
  clear: () => void
}

export const useOnboardingDocumentsStore = create<OnboardingDocumentsState>((set) => ({
  licenseFile: null,
  identityFile: null,
  setLicenseFile: (licenseFile) => set({ licenseFile }),
  setIdentityFile: (identityFile) => set({ identityFile }),
  clear: () => set({ licenseFile: null, identityFile: null }),
}))

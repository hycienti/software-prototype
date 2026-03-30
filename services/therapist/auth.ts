import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  TherapistProfile,
  TherapistVerifyOtpResponse,
  TherapistOnboardResponse,
  TherapistOnboardPayload,
  DocumentUploadResponse,
  PickedFile,
} from '@/types/therapist'

/** Backend returns { success: true, data: T }. Unwrap to T (same as patient `services/auth`). */
function unwrap<T>(response: { success?: boolean; data?: T } | T): T {
  if (response && typeof response === 'object' && 'success' in response && response.data !== undefined) {
    return response.data as T
  }
  return response as T
}

export async function sendOtp(email: string): Promise<{ message?: string; expiresIn?: number }> {
  const res = await apiClient.post<{ message?: string; expiresIn?: number } | { success: true; data: { message?: string; expiresIn?: number } }>(
    API_ENDPOINTS.THERAPIST.AUTH.SEND_OTP,
    { email }
  )
  return unwrap(res)
}

export async function verifyOtp(email: string, code: string): Promise<TherapistVerifyOtpResponse> {
  const res = await apiClient.post<TherapistVerifyOtpResponse | { success: true; data: TherapistVerifyOtpResponse }>(
    API_ENDPOINTS.THERAPIST.AUTH.VERIFY_OTP,
    { email, code }
  )
  return unwrap(res)
}

export async function onboard(payload: TherapistOnboardPayload): Promise<TherapistOnboardResponse> {
  const res = await apiClient.post<TherapistOnboardResponse | { success: true; data: TherapistOnboardResponse }>(
    API_ENDPOINTS.THERAPIST.AUTH.ONBOARD,
    payload
  )
  return unwrap(res)
}

export async function getSpecialties(): Promise<string[]> {
  const res = await apiClient.get<string[] | { success: true; data: string[] }>(
    API_ENDPOINTS.THERAPIST.AUTH.SPECIALTIES
  )
  const data = unwrap(res)
  return Array.isArray(data) ? data : []
}

export async function getMe(): Promise<TherapistProfile> {
  const res = await apiClient.get<{ therapist: TherapistProfile } | { success: true; data: { therapist: TherapistProfile } }>(
    API_ENDPOINTS.THERAPIST.AUTH.ME
  )
  return unwrap(res).therapist
}

export async function updateMe(payload: {
  fullName?: string
  professionalTitle?: string
  licenseUrl?: string | null
  identityUrl?: string | null
}): Promise<TherapistProfile> {
  const res = await apiClient.patch<{ therapist: TherapistProfile } | { success: true; data: { therapist: TherapistProfile } }>(
    API_ENDPOINTS.THERAPIST.AUTH.ME,
    payload
  )
  return unwrap(res).therapist
}

export async function uploadDocument(
  type: 'license' | 'identity',
  file: PickedFile
): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', {
    uri: file.uri,
    name: file.name || (type === 'license' ? 'license.pdf' : 'identity.pdf'),
    type: file.mimeType ?? 'application/pdf',
  } as unknown as Blob)
  const res = await apiClient.post<DocumentUploadResponse | { success: true; data: DocumentUploadResponse }>(
    API_ENDPOINTS.THERAPIST.AUTH.DOCUMENTS_UPLOAD,
    formData
  )
  return unwrap(res)
}

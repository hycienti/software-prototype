import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CachedMessage {
  id: string | number
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  pending?: boolean
  error?: string
}

const MESSAGE_CACHE_PREFIX = 'conversation_messages_'
const OFFLINE_QUEUE_KEY = 'offline_message_queue'

/**
 * Message caching utilities for offline support
 */

/**
 * Cache messages for a conversation
 */
export async function cacheMessages(
  conversationId: number,
  messages: CachedMessage[]
): Promise<void> {
  try {
    const key = `${MESSAGE_CACHE_PREFIX}${conversationId}`
    await AsyncStorage.setItem(key, JSON.stringify(messages))
  } catch (error) {
    console.error('Error caching messages:', error)
  }
}

/**
 * Get cached messages for a conversation
 */
export async function getCachedMessages(
  conversationId: number
): Promise<CachedMessage[] | null> {
  try {
    const key = `${MESSAGE_CACHE_PREFIX}${conversationId}`
    const cached = await AsyncStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error getting cached messages:', error)
    return null
  }
}

/**
 * Clear cached messages for a conversation
 */
export async function clearCachedMessages(conversationId: number): Promise<void> {
  try {
    const key = `${MESSAGE_CACHE_PREFIX}${conversationId}`
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing cached messages:', error)
  }
}

/**
 * Add message to offline queue
 */
export async function addToOfflineQueue(
  conversationId: number | null,
  message: string,
  mode: 'text' | 'voice' = 'text'
): Promise<void> {
  try {
    const queue = await getOfflineQueue()
    queue.push({
      conversationId,
      message,
      mode,
      timestamp: new Date().toISOString(),
      retries: 0,
    })
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('Error adding to offline queue:', error)
  }
}

/**
 * Get offline message queue
 */
export async function getOfflineQueue(): Promise<
  {
    conversationId: number | null
    message: string
    mode: 'text' | 'voice'
    timestamp: string
    retries: number
  }[]
> {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    return queue ? JSON.parse(queue) : []
  } catch (error) {
    console.error('Error getting offline queue:', error)
    return []
  }
}

/**
 * Remove item from offline queue
 */
export async function removeFromOfflineQueue(index: number): Promise<void> {
  try {
    const queue = await getOfflineQueue()
    queue.splice(index, 1)
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('Error removing from offline queue:', error)
  }
}

/**
 * Clear offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY)
  } catch (error) {
    console.error('Error clearing offline queue:', error)
  }
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    // Simple check - in production, use NetInfo
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    })
    return true
  } catch {
    return false
  }
}

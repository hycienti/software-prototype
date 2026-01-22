import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Conversation {
  id: number
  title: string | null
  mode: 'text' | 'voice'
  createdAt: string
}

interface ConversationContextType {
  currentConversation: Conversation | null
  setCurrentConversation: (conversation: Conversation | null) => void
  updateConversationId: (id: number | null) => void
  clearConversation: () => void
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

const CONVERSATION_STORAGE_KEY = 'current_conversation'

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [currentConversation, setCurrentConversationState] = useState<Conversation | null>(null)

  // Load conversation from storage on mount
  React.useEffect(() => {
    const loadConversation = async () => {
      try {
        const stored = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY)
        if (stored) {
          setCurrentConversationState(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading conversation from storage:', error)
      }
    }
    loadConversation()
  }, [])

  const setCurrentConversation = useCallback(async (conversation: Conversation | null) => {
    setCurrentConversationState(conversation)
    try {
      if (conversation) {
        await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversation))
      } else {
        await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving conversation to storage:', error)
    }
  }, [])

  const updateConversationId = useCallback(
    async (id: number | null) => {
      if (id && (!currentConversation || currentConversation.id !== id)) {
        // Only update if we have a new ID
        await setCurrentConversation({
          id,
          title: currentConversation?.title || null,
          mode: currentConversation?.mode || 'text',
          createdAt: currentConversation?.createdAt || new Date().toISOString(),
        })
      } else if (!id) {
        await setCurrentConversation(null)
      }
    },
    [currentConversation, setCurrentConversation]
  )

  const clearConversation = useCallback(async () => {
    setCurrentConversationState(null)
    try {
      await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing conversation from storage:', error)
    }
  }, [])

  return (
    <ConversationContext.Provider
      value={{
        currentConversation,
        setCurrentConversation,
        updateConversationId,
        clearConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversationContext() {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider')
  }
  return context
}

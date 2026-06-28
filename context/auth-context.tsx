"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Address } from '@/types'
import { mockUser, mockAddresses } from '@/lib/mock-data'
import { identifyUser, identifyFromStoredData } from '@/lib/tiktok-pixel'

interface AuthContextType {
  user: User | null
  addresses: Address[]
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  addAddress: (address: Omit<Address, 'id' | 'user_id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for saved session
    const savedUser = localStorage.getItem('techmart_user')
    const savedAddresses = localStorage.getItem('techmart_addresses')
    
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setAddresses(savedAddresses ? JSON.parse(savedAddresses) : mockAddresses)
      // Sync PII to TikTok for logged-in users
      if (userData.email || userData.phone) {
        identifyUser(userData.email, userData.phone, userData.name)
      }
    } else {
      // Try to identify from stored PII (checkout flow)
      identifyFromStoredData()
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo, accept any email with password "password"
    if (password === 'password' || email === 'demo@techmart.pk') {
      const userData: User = {
        ...mockUser,
        email,
        name: email.split('@')[0]
      }
      setUser(userData)
      setAddresses(mockAddresses)
      localStorage.setItem('techmart_user', JSON.stringify(userData))
      localStorage.setItem('techmart_addresses', JSON.stringify(mockAddresses))
      // Sync PII to TikTok on login
      identifyUser(userData.email, userData.phone, userData.name)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const signup = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData: User = {
      id: Date.now().toString(),
      email,
      name,
      phone,
      role: 'customer',
      created_at: new Date().toISOString()
    }
    
    setUser(userData)
    setAddresses([])
    localStorage.setItem('techmart_user', JSON.stringify(userData))
    localStorage.setItem('techmart_addresses', JSON.stringify([]))
    // Sync PII to TikTok on signup
    identifyUser(userData.email, userData.phone, userData.name)
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    setAddresses([])
    localStorage.removeItem('techmart_user')
    localStorage.removeItem('techmart_addresses')
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('techmart_user', JSON.stringify(updatedUser))
    }
  }

  const addAddress = (address: Omit<Address, 'id' | 'user_id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
      user_id: user?.id || ''
    }
    const updatedAddresses = [...addresses, newAddress]
    setAddresses(updatedAddresses)
    localStorage.setItem('techmart_addresses', JSON.stringify(updatedAddresses))
  }

  const updateAddress = (id: string, data: Partial<Address>) => {
    const updatedAddresses = addresses.map(addr =>
      addr.id === id ? { ...addr, ...data } : addr
    )
    setAddresses(updatedAddresses)
    localStorage.setItem('techmart_addresses', JSON.stringify(updatedAddresses))
  }

  const deleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id)
    setAddresses(updatedAddresses)
    localStorage.setItem('techmart_addresses', JSON.stringify(updatedAddresses))
  }

  const setDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id
    }))
    setAddresses(updatedAddresses)
    localStorage.setItem('techmart_addresses', JSON.stringify(updatedAddresses))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

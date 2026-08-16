import { useCallback, useEffect, useState } from "react"
import CryptoJS from "crypto-js"

type SetValue<T> = T | ((value: T) => T)

interface UseLocalStorageOptions {
  encrypted?: boolean
}

const STORAGE_SYNC_EVENT = "personal-ai-storage"

function encryptionKey(): string {
  const key = import.meta.env.VITE_SECRET_KEY
  if (!key) throw new Error("VITE_SECRET_KEY wajib dikonfigurasi untuk encrypted storage.")
  return key
}

export function setData<T>(storageKey: string, value: T): void {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), encryptionKey()).toString()
  localStorage.setItem(storageKey, encrypted)
  window.dispatchEvent(new Event(STORAGE_SYNC_EVENT))
}

export function getData<T>(storageKey: string): T | null {
  const encrypted = localStorage.getItem(storageKey)
  if (!encrypted) return null

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey()).toString(CryptoJS.enc.Utf8)
    if (!decrypted) throw new Error("Encrypted storage tidak dapat didekripsi.")
    return JSON.parse(decrypted) as T
  } catch (error) {
    localStorage.removeItem(storageKey)
    console.error(`Data localStorage rusak untuk key ${storageKey}.`, error)
    return null
  }
}

export function removeData(storageKey: string): void {
  localStorage.removeItem(storageKey)
  window.dispatchEvent(new Event(STORAGE_SYNC_EVENT))
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {},
): [T, (value: SetValue<T>) => void] {
  const { encrypted = false } = options
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValue
    const stored = encrypted ? getData<T>(key) : localStorage.getItem(key)
    if (stored !== null) return encrypted ? (stored as T) : (JSON.parse(stored as string) as T)
    return initialValue
  }, [encrypted, initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  useEffect(() => {
    const synchronize = () => setStoredValue(readValue())
    window.addEventListener("storage", synchronize)
    window.addEventListener(STORAGE_SYNC_EVENT, synchronize)
    return () => {
      window.removeEventListener("storage", synchronize)
      window.removeEventListener(STORAGE_SYNC_EVENT, synchronize)
    }
  }, [readValue])

  const setValue = (value: SetValue<T>) => {
    setStoredValue((current) => {
      const next = typeof value === "function" ? (value as (input: T) => T)(current) : value
      if (encrypted) setData(key, next)
      else {
        localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event(STORAGE_SYNC_EVENT))
      }
      return next
    })
  }

  return [storedValue, setValue]
}

export default useLocalStorage

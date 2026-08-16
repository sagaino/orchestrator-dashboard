import CryptoJS from "crypto-js"

export const getTimestamp = () => Date.now()

type SignaturePrimitive = string | number | boolean | null | undefined
type SignatureValue = SignaturePrimitive | SignatureValue[] | SignatureRecord
type SignatureRecord = { [key: string]: SignatureValue }

function flattenObject(obj: SignatureRecord, prefix = ""): Record<string, SignaturePrimitive> {
  let flattened: Record<string, SignaturePrimitive> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const prefixedKey = prefix === "" ? key : `${prefix}.${key}`
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        flattened = { ...flattened, ...flattenObject(value, prefixedKey) }
      } else if (Array.isArray(value)) {
        flattened[prefixedKey] = ""
      } else {
        flattened[prefixedKey] = value
      }
    }
  }
  return flattened
}

function formatObject(obj: SignatureRecord): string {
  const flattened = flattenObject(obj)
  return Object.keys(flattened)
    .sort()
    .map((key) => `${key}${flattened[key] ?? ""}`)
    .join("")
}

export const makeSignature = (
  email: number,
  timestamp: number,
  data: SignatureRecord | FormData,
): string => {
  const formDataObject: SignatureRecord = { email, timestamp }
  if (data instanceof FormData) {
    for (const pair of data.entries()) {
      formDataObject[pair[0]] = typeof pair[1] === "string" ? pair[1] : pair[1].name
    }
  }

  const payload = data instanceof FormData ? formDataObject : { email, ...data, timestamp }
  return CryptoJS.SHA1(formatObject(payload)).toString()
}

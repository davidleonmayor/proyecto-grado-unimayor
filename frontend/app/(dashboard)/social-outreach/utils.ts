/** Normalize and trim text to a safe maximum length. */
export const sanitizeText = (text: string, maxLength: number): string => {
  if (!text) return ""
  const withoutHtml = text.replace(/<[^>]*>/g, "")
  const withoutControl = withoutHtml.replace(/[\u0000-\u001F\u007F]/g, " ")
  const normalized = withoutControl.replace(/\s+/g, " ").trim()
  return normalized.slice(0, maxLength)
}

/** Create a safe PDF filename using a restricted character set. */
export const sanitizeFileName = (fileName: string): string => {
  const baseName = fileName.replace(/\.pdf$/i, "")
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100)
  if (!sanitizedBase) return ""
  return `${sanitizedBase}.pdf`
}

/** Check the PDF magic number signature (%PDF-). */
export const isPdfMagicNumber = (buffer: ArrayBuffer): boolean => {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]
  const bytes = new Uint8Array(buffer.slice(0, 5))
  return signature.every((byte, index) => bytes[index] === byte)
}

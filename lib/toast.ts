import { toast } from 'sonner'

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description })
}

export function toastError(message: string, description?: string) {
  toast.error(message, { description })
}

export function toastInfo(message: string, description?: string) {
  toast(message, { description })
}

export function toastFromError(err: unknown, fallback = 'Something went wrong') {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : fallback

  // Friendly mapping for common Postgres errors
  if (message.includes('duplicate key') || message.includes('unique')) {
    toastError('Already exists', 'A record with those details already exists.')
    return
  }
  if (message.includes('violates foreign key')) {
    toastError('Invalid reference', 'A linked record no longer exists.')
    return
  }
  if (message.includes('row-level security')) {
    toastError('Permission denied', 'You do not have access to do that.')
    return
  }

  toastError(fallback, message)
}
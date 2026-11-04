import type { FormInstance } from 'antd'

import { errorMessage, fieldErrors } from '../api/client'

/** Place les erreurs de l'API sous les champs ; rend le message général
 *  s'il en reste un qui ne correspond à aucun champ. */
export function showFormErrors(form: FormInstance, error: unknown): string | null {
  const errors = fieldErrors(error)
  const known = new Set(
    Object.keys(form.getFieldsValue(true) as Record<string, unknown>),
  )
  form.setFields(
    Object.entries(errors)
      .filter(([name]) => known.has(name))
      .map(([name, messages]) => ({ name, errors: messages })),
  )
  const others = Object.keys(errors).filter((name) => !known.has(name))
  return others.length || !Object.keys(errors).length ? errorMessage(error) : null
}

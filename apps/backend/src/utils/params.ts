import { Request } from 'express'

/** Safe extraction of route param as single string (handles string | string[] from Express) */
export function getParam(req: Request, key: string): string | undefined {
  const val = req.params[key]
  return val === undefined ? undefined : Array.isArray(val) ? val[0] : val
}

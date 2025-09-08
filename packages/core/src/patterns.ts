// Default detection patterns for DocGuard MVP
import { PatternSet } from './types'

export const defaultPatterns: PatternSet = {
  authentication: [
    {
      terms: [
        'API key',
        'Bearer token',
        'Authorization',
        'access token',
        'auth token',
        'authentication',
        'login',
        'password',
        'credential',
      ],
      severity: 'critical',
    },
  ],

  rateLimits: [
    {
      terms: [
        'rate limit',
        'requests per minute',
        'requests per second',
        'throttling',
        'quota',
        'limit exceeded',
      ],
      regex: /\d+\s*requests?/i,
      severity: 'warning',
    },
  ],

  errors: [
    {
      terms: [
        'error code',
        'status code',
        'error message',
        'exception',
        'failure',
        '404',
        '500',
        '401',
        '403',
      ],
      severity: 'warning',
    },
  ],

  endpoints: [
    {
      terms: [
        'endpoint',
        'API endpoint',
        'URL',
        'path parameter',
        'query parameter',
        'request body',
        'response body',
      ],
      severity: 'info',
    },
  ],
}

export function getDefaultPatterns(): PatternSet {
  return defaultPatterns
}

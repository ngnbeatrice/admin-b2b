'use client'

import { ServerCrashIcon, AlertTriangleIcon, ClockIcon } from 'lucide-react'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service (Sentry, etc.)
    console.error('Critical error:', error)
  }, [error])

  const timestamp = new Date().toISOString()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>500 - Server Error</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);
            color: #fafafa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            width: 100%;
          }
          
          .error-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          
          .error-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .error-icon {
            width: 64px;
            height: 64px;
            color: #ef4444;
            flex-shrink: 0;
          }
          
          .error-title {
            font-size: 32px;
            font-weight: 700;
            color: #fafafa;
            margin: 0;
          }
          
          .error-subtitle {
            font-size: 18px;
            color: #10b981;
            margin: 0;
            font-weight: 500;
          }
          
          .error-description {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 32px;
          }
          
          .technical-details {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          
          .details-title {
            font-size: 14px;
            font-weight: 600;
            color: #10b981;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .detail-row {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
          }
          
          .detail-row:last-child {
            margin-bottom: 0;
          }
          
          .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-value {
            font-size: 14px;
            color: #fafafa;
            font-family: 'JetBrains Mono', monospace;
            word-break: break-word;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .error-message {
            color: #ef4444;
          }
          
          .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          
          .btn-primary {
            background: #047857;
            color: white;
          }
          
          .btn-primary:hover {
            background: #065f46;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
          }
          
          .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fafafa;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }
          
          .warning-icon {
            width: 16px;
            height: 16px;
          }
          
          @media (max-width: 640px) {
            .error-card {
              padding: 32px 24px;
            }
            
            .error-header {
              flex-direction: column;
              text-align: center;
            }
            
            .error-icon {
              width: 48px;
              height: 48px;
            }
            
            .error-title {
              font-size: 24px;
            }
            
            .actions {
              flex-direction: column;
            }
            
            .btn {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="error-card">
            <div className="error-header">
              <ServerCrashIcon className="error-icon" />
              <div>
                <h1 className="error-title">500 - Server Error</h1>
                <p className="error-subtitle">Critical System Error</p>
              </div>
            </div>

            <p className="error-description">
              The application encountered a critical error and cannot continue. Our team has been
              automatically notified and is working to resolve the issue.
            </p>

            <div className="technical-details">
              <div className="details-title">
                <AlertTriangleIcon className="warning-icon" />
                Technical Details
              </div>

              <div className="detail-row">
                <span className="detail-label">Error Message</span>
                <code className="detail-value error-message">
                  {error.message || 'Unknown error occurred'}
                </code>
              </div>

              {error.digest && (
                <div className="detail-row">
                  <span className="detail-label">Error ID</span>
                  <code className="detail-value">{error.digest}</code>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Timestamp</span>
                <code className="detail-value">
                  <ClockIcon
                    style={{
                      width: '14px',
                      height: '14px',
                      display: 'inline',
                      marginRight: '6px',
                      verticalAlign: 'middle',
                    }}
                  />
                  {timestamp}
                </code>
              </div>

              {error.stack && process.env.NODE_ENV === 'development' && (
                <div className="detail-row">
                  <span className="detail-label">Stack Trace (Development Only)</span>
                  <code className="detail-value" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                    {error.stack}
                  </code>
                </div>
              )}
            </div>

            <div className="actions">
              <button onClick={reset} className="btn btn-primary">
                Try again
              </button>
              <button onClick={() => (window.location.href = '/')} className="btn btn-secondary">
                Back to home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

import { useState } from 'react'
import { supabase } from '../supabaseClient'

function getFriendlyAuthError(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Create an account first, or check the password for this email.'
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'This account is waiting for email confirmation. Turn off Email Confirmations in Supabase Auth settings for lab testing.'
  }

  if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
    return 'This email is already registered. Switch to sign in instead.'
  }

  if (lowerMessage.includes('password')) {
    return 'Use a password with at least 6 characters.'
  }

  return message
}

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || password.length < 6) {
      setError('Use a valid email and a password of at least 6 characters.')
      return
    }

    setLoading(true)

    const result = isSignup
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() || null },
          },
        })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

    if (result.error) {
      setError(getFriendlyAuthError(result.error.message))
    } else if (isSignup && !result.data.session) {
      setMessage('Account created. If you are not signed in automatically, turn off Email Confirmations in Supabase Auth settings.')
    } else {
      setMessage(isSignup ? 'Account created and signed in.' : 'Signed in successfully.')
    }

    setLoading(false)
  }

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup')
    setError('')
    setMessage('')
  }

  return (
    <section className="auth-section" aria-label="Authentication">
      <div>
        <p className="section-kicker">{isSignup ? 'Create account' : 'Member access'}</p>
        <h2>{isSignup ? 'Register to publish' : 'Sign in to publish'}</h2>
        <p className="muted">The notice board stays public. Publishing is reserved for registered users.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignup && (
          <label>
            Display name
            <input
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Optional"
            />
          </label>
        )}

        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@example.com"
          />
        </label>

        <label>
          Password
          <input
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
          />
        </label>

        <div className="form-actions">
          <button className="button primary" disabled={loading} type="submit">
            {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Sign in'}
          </button>
          <button className="button ghost" type="button" onClick={switchMode}>
            {isSignup ? 'Use sign in' : 'Create account'}
          </button>
        </div>

        {error && <p className="form-alert error">{error}</p>}
        {message && <p className="form-alert success">{message}</p>}
      </form>
    </section>
  )
}

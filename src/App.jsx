import { useEffect, useState } from 'react'
import './App.css'
import Auth from './components/Auth'
import NoticeBoard from './components/NoticeBoard'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="page-loading">Loading notice board...</div>
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">Bahria University Islamabad</p>
          <h1>Campus Notice Board</h1>
          <p className="masthead-copy">A concise bulletin for academic notices, events, urgent alerts, and campus updates.</p>
        </div>

        <div className="session-card">
          {session ? (
            <>
              <span className="session-label">Signed in</span>
              <strong>{session.user.email}</strong>
              <button className="button subtle" onClick={handleSignOut} type="button">
                Sign out
              </button>
            </>
          ) : (
            <>
              <span className="session-label">Visitor mode</span>
              <strong>Read-only access</strong>
            </>
          )}
        </div>
      </header>

      {!isSupabaseConfigured && (
        <section className="notice-banner error">
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, save it, then restart Vite.
        </section>
      )}

      {!session && isSupabaseConfigured && <Auth />}
      <NoticeBoard session={session} />
    </main>
  )
}

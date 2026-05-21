import { useState } from 'react'
import { NOTICE_CATEGORIES } from '../constants'
import { supabase } from '../supabaseClient'

export default function NoticeForm({ session, onPost }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim() || !body.trim()) {
      setError('Both title and body are required.')
      return
    }

    setLoading(true)
    setError('')

    const { data: existingProfile, error: profileLookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profileLookupError) {
      setError(profileLookupError.message)
      setLoading(false)
      return
    }

    if (!existingProfile) {
      const { error: profileInsertError } = await supabase.from('profiles').insert({
        id: session.user.id,
        email: session.user.email,
        display_name: session.user.user_metadata?.display_name ?? null,
      })

      if (profileInsertError) {
        setError(profileInsertError.message)
        setLoading(false)
        return
      }
    }

    const { error: insertError } = await supabase.from('notices').insert({
      title: title.trim(),
      body: body.trim(),
      category,
      user_id: session.user.id,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setTitle('')
      setBody('')
      setCategory('General')
      onPost()
    }

    setLoading(false)
  }

  return (
    <form className="notice-form" onSubmit={handleSubmit}>
      <div>
        <p className="section-kicker">Submit notice</p>
        <h2>Post a new notice</h2>
      </div>

      <label>
        Title
        <input placeholder="Notice title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label>
        Body
        <textarea
          placeholder="Write your notice here..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
        />
      </label>

      <div className="form-row">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {NOTICE_CATEGORIES.map((categoryName) => (
              <option key={categoryName}>{categoryName}</option>
            ))}
          </select>
        </label>

        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post notice'}
        </button>
      </div>

      {error && <p className="form-alert error">{error}</p>}
    </form>
  )
}

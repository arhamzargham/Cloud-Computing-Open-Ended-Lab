import { useState } from 'react'
import { supabase } from '../supabaseClient'

const dateFormatter = new Intl.DateTimeFormat('en-PK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function NoticeCard({ notice, session, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const isOwner = Boolean(session?.user?.id && session.user.id === notice.user_id)

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    const { error: deleteError } = await supabase.from('notices').delete().eq('id', notice.id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      onDeleted(notice.id)
    }

    setDeleting(false)
  }

  return (
    <article className={`notice-card category-${notice.category.toLowerCase()}`}>
      <div className="notice-card-top">
        <span className="category-chip">{notice.category}</span>
        <time dateTime={notice.created_at}>{dateFormatter.format(new Date(notice.created_at))}</time>
      </div>

      <h3>{notice.title}</h3>
      <p>{notice.body}</p>

      <div className="notice-card-footer">
        <span>{isOwner ? 'Posted by you' : 'Campus notice'}</span>
        {isOwner && (
          <button className="button danger" disabled={deleting} onClick={handleDelete} type="button">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {error && <p className="form-alert error">{error}</p>}
    </article>
  )
}

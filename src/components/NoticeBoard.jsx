import { useCallback, useEffect, useMemo, useState } from 'react'
import { NOTICE_CATEGORIES } from '../constants'
import { isSupabaseConfigured, supabase } from '../supabaseClient'
import NoticeCard from './NoticeCard'
import NoticeForm from './NoticeForm'

const ALL_CATEGORIES = ['All', ...NOTICE_CATEGORIES]

export default function NoticeBoard({ session }) {
  const [notices, setNotices] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  const fetchNotices = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setError('')
    const { data, error: fetchError } = await supabase
      .from('notices')
      .select('id, user_id, title, body, category, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setNotices(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices()
  }, [fetchNotices])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    const channel = supabase
      .channel('notices-realtime-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notices' },
        () => {
          fetchNotices()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotices])

  const filteredNotices = useMemo(() => {
    if (activeCategory === 'All') {
      return notices
    }

    return notices.filter((notice) => notice.category === activeCategory)
  }, [activeCategory, notices])

  const handleDeleted = (noticeId) => {
    setNotices((current) => current.filter((notice) => notice.id !== noticeId))
  }

  return (
    <section className="board-section">
      <div className="board-toolbar">
        <div>
          <p className="section-kicker">Latest bulletin</p>
          <h2>Notices</h2>
        </div>

        <div className="filter-tabs" aria-label="Filter notices by category">
          {ALL_CATEGORIES.map((category) => (
            <button
              className={category === activeCategory ? 'filter-tab active' : 'filter-tab'}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {session && <NoticeForm session={session} onPost={fetchNotices} />}

      {error && <p className="notice-banner error">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading notices...</p>
      ) : filteredNotices.length > 0 ? (
        <div className="notice-grid">
          {filteredNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} session={session} onDeleted={handleDeleted} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {activeCategory === 'All'
            ? 'No notices have been posted yet.'
            : `No ${activeCategory.toLowerCase()} notices right now.`}
        </p>
      )}
    </section>
  )
}

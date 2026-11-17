/** My Library: search, filter and sort the documents and lessons. */
import { useState, useEffect } from 'react'
import { api, type Doc } from '../api'
import type { Go } from '../lib/router'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load, toast } from '../components/ui'

export function Library({ go, q0 }: { go: Go; q0: string }) {
  const docs = useApi(api.documents)
  const [query, setQuery] = useState(q0)
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Recently Added')
  const [menu, setMenu] = useState<string | null>(null)
  const [removed, setRemoved] = useState<string[]>([])
  useEffect(() => { setQuery(q0) }, [q0])
  const remove = (d: Doc) => { setMenu(null); setRemoved(r => [...r, d.id]); api.deleteDocument(d.id).then(() => toast('Deleted')).catch(() => { setRemoved(r => r.filter(x => x !== d.id)); toast('Couldn’t delete this item') }) }
  return <>
    <div className="hero-row"><div><span className="eyebrow">YOUR KNOWLEDGE SPACE</span><h1>My Library</h1><p>Everything you’ve uploaded, transformed, and learned.</p></div><button className="primary" onClick={() => go('upload')}><Icon name="plus" size={18}/> Upload PDF</button></div>
    <div className="library-tools card"><div className="library-search"><Icon name="search" size={18}/><input aria-label="Search library" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your documents and lessons…"/></div>
      <div className="filter-tabs">{['All', 'PDFs', 'AI Lessons', 'Completed'].map(x => <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
      <select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}><option>Recently Added</option><option>Name</option><option>Last Opened</option></select></div>
    <Load q={docs}>{all => {
      const list = all.filter(d => !removed.includes(d.id) && d.title.toLowerCase().includes(query.toLowerCase()) &&
        (filter === 'All' || (filter === 'PDFs' && d.status === 'pdf') || (filter === 'AI Lessons' && d.status === 'ready') || (filter === 'Completed' && d.progress === 100)))
        .sort((a, b) => sort === 'Name' ? a.title.localeCompare(b.title) : sort === 'Last Opened' ? b.progress - a.progress : 0)
      return list.length ? <div className="doc-grid">{list.map((d, i) => <article className="doc-card" key={d.id}>
        <button className="more-btn" aria-label={`Options for ${d.title}`} aria-expanded={menu === d.id} onClick={() => setMenu(menu === d.id ? null : d.id)}><Icon name="more"/></button>
        {menu === d.id && <><button className="scrim clear" aria-label="Close menu" onClick={() => setMenu(null)}/><div className="pop"><button onClick={() => go(d.status === 'ready' ? 'overview' : 'upload', d.id)}>{d.status === 'ready' ? 'Open lesson' : 'Generate lesson'}</button><button onClick={() => remove(d)}>Delete</button></div></>}
        <button className={`doc-cover ${d.tone}`} aria-label={`Open ${d.title}`} onClick={() => go(d.status === 'ready' ? 'overview' : 'upload', d.id)}><span>PDF</span><Icon name={i % 2 ? 'book' : 'spark'} size={40}/><small>{String(i + 1).padStart(2, '0')}</small></button>
        <span className="status"><i/> {d.status === 'ready' ? 'AI lesson ready' : 'PDF uploaded'}</span><h3>{d.title}</h3><p>{d.subject} · {d.date}</p><div className="doc-progress"><div><i style={{ width: `${d.progress}%` }}/></div><span>{d.progress}%</span></div>
        <button className="secondary wide" onClick={() => d.status === 'pdf' ? go('upload', d.id) : go(d.progress ? 'lesson' : 'overview', d.id)}>{d.status === 'pdf' ? 'Generate lesson' : d.progress ? 'Continue learning' : 'Start lesson'}</button>
      </article>)}</div> : <div className="empty card"><span><Icon name="search" size={28}/></span><h2>No results found</h2><p>Try another title or clear your filters.</p><button className="secondary" onClick={() => { setQuery(''); setFilter('All') }}>Clear search</button></div>
    }}</Load>
  </>
}

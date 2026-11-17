/** The frame around most pages: sidebar, top bar (search, notifications, account menu). */
import { useState, useEffect } from 'react'
import { api } from '../api'
import type { Go, Page } from '../lib/router'
import { signOut } from '../lib/auth'
import { useApi } from '../lib/hooks'
import { Icon } from './Icon'

const nav = [
  ['dashboard', 'home', 'Dashboard'], ['library', 'book', 'My Library'], ['upload', 'upload', 'Create Lesson'],
  ['flashcards', 'cards', 'Flashcards'], ['progress', 'chart', 'Progress'],
] as const

export function AppShell({ page, go, children }: { page: Page; go: Go; children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false)
  const [menu, setMenu] = useState<'bell' | 'user' | null>(null)
  const [search, setSearch] = useState('')
  const profile = useApi(api.profile)
  const notes = useApi(api.notifications)
  const name = profile.data?.name ?? 'Alex Kim'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(null); setMobile(false) } }
    addEventListener('keydown', f); return () => removeEventListener('keydown', f)
  }, [])
  const open = (p: Page) => { go(p); setMobile(false); setMenu(null) }
  return <div className="app-shell">
    <aside className={mobile ? 'sidebar open' : 'sidebar'}>
      <button className="brand" onClick={() => open('dashboard')}><span className="brand-mark"><Icon name="spark" size={19}/></span><span>learnova<span>.ai</span></span></button>
      <nav aria-label="Main">{nav.map(([p, icon, label]) => <button key={p} className={page === p ? 'nav-item active' : 'nav-item'} aria-current={page === p ? 'page' : undefined} onClick={() => open(p)}><Icon name={icon}/><span>{label}</span>{p === 'upload' && <span className="nav-plus"><Icon name="plus" size={15}/></span>}</button>)}</nav>
      <div className="sidebar-spacer"/>
      <button className={page === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => open('settings')}><Icon name="settings"/><span>Settings</span></button>
      <div className="help-card"><span className="tiny-label">LEARNING TIP</span><p>Study a little every day. Your 7-day streak is going strong.</p><button onClick={() => open('progress')}>View progress <Icon name="arrow" size={14}/></button></div>
      <div className="profile-mini"><div className="avatar">{initials}</div><div><strong>{name}</strong><span>Computer Science</span></div>
        <button className="icon-btn" aria-label="Account menu" aria-expanded={menu === 'user'} onClick={() => setMenu(menu === 'user' ? null : 'user')}><Icon name="more" size={18}/></button>
        {menu === 'user' && <div className="pop user-pop"><button onClick={() => open('settings')}>Settings</button><button onClick={() => { signOut(); setMenu(null) }}>Sign out</button></div>}
      </div>
    </aside>
    {mobile && <button className="scrim" aria-label="Close menu" onClick={() => setMobile(false)}/>}
    {menu && <button className="scrim clear" aria-label="Close menu" onClick={() => setMenu(null)}/>}
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMobile(true)}><Icon name="menu"/></button>
        <form className="top-search" role="search" onSubmit={e => { e.preventDefault(); go('library', undefined, search.trim()) }}><Icon name="search" size={18}/><input aria-label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything…"/></form>
        <div className="top-actions">
          <button className="icon-btn" aria-label="Notifications" aria-expanded={menu === 'bell'} onClick={() => setMenu(menu === 'bell' ? null : 'bell')}><Icon name="bell"/>{!!notes.data?.length && <span className="dot"/>}</button>
          {menu === 'bell' && <div className="pop bell-pop"><strong className="pop-title">Notifications</strong>{notes.data?.length ? notes.data.map(n => <div className="note" key={n.id}><p>{n.text}</p><small>{n.time}</small></div>) : <p className="note">You’re all caught up.</p>}</div>}
          <button className="top-avatar" aria-label="Open settings" onClick={() => open('settings')}>{initials}</button>
        </div>
      </header>
      <div className="page">{children}</div>
    </main>
  </div>
}

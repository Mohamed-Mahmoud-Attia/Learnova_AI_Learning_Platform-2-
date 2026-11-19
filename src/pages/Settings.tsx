/** Settings and profile. */
import { useState, useRef } from 'react'
import { api, type Profile } from '../api'
import { signOut } from '../lib/auth'
import { useApi } from '../lib/hooks'
import { Load, Toggle, toast } from '../components/ui'

const TABS = ['Profile', 'Appearance', 'Notifications', 'Account']
export function Settings() {
  const q = useApi(api.profile)
  return <><div className="page-title"><span className="eyebrow">YOUR EXPERIENCE</span><h1>Settings & Profile</h1><p>Manage your profile and personalize how Learnova supports you.</p></div><Load q={q}>{p => <SettingsView initial={p}/>}</Load></>
}
function SettingsView({ initial }: { initial: Profile }) {
  const [saved, setSaved] = useState(initial), [f, setF] = useState(initial), [tab, setTab] = useState('Profile'), [busy, setBusy] = useState(false), [photo, setPhoto] = useState('')
  const pic = useRef<HTMLInputElement>(null)
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF(x => ({ ...x, [k]: v }))
  const dirty = JSON.stringify(f) !== JSON.stringify(saved)
  const show = (t: string) => tab === 'Profile' || tab === t
  const initials = f.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const save = async () => { setBusy(true); try { const r = await api.saveProfile(f); setSaved(r); setF(r); toast('Changes saved') } catch { toast('Couldn’t save your changes') } finally { setBusy(false) } }
  const editable = ['Profile', 'Notifications'].includes(tab)
  return <div className="settings-layout">
    <aside className="settings-menu" role="tablist">{TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</aside>
    <section className="card settings-form">
      {tab === 'Profile' && <><div className="settings-profile"><div className="large-avatar">{photo ? <img src={photo} alt=""/> : initials}</div><div><h2>{saved.name}</h2><p>Computer Science Student</p></div>
        <input ref={pic} hidden type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)) /* TODO: upload the photo to the backend */ }}/><button className="secondary" onClick={() => pic.current?.click()}>Change photo</button></div><hr/>
        <h2>Profile information</h2><div className="form-grid"><label>Full name<input value={f.name} onChange={e => set('name', e.target.value)}/></label><label>Email address<input type="email" value={f.email} onChange={e => set('email', e.target.value)}/></label></div></>}
        {show('Notifications') && <><h3>Notifications</h3>{([['reminders', 'Learning reminders'], ['quizResults', 'Quiz result notifications'], ['weekly', 'Weekly progress summary']] as const).map(([k, label]) => <div className="toggle-row" key={k}><div><strong>{label}</strong><small>Receive helpful updates about {label.toLowerCase()}.</small></div><Toggle label={label} checked={f[k]} onChange={v => set(k, v)}/></div>)}</>}
      {tab === 'Appearance' && <div className="state"><h2>Appearance</h2><p>Theme options are coming soon.</p></div>}
      {tab === 'Account' && <div className="state"><h2>Account</h2><p>Signed in as {saved.email}</p><button className="secondary" onClick={signOut}>Sign out</button></div>}
      {editable && <div className="form-actions"><button className="tertiary" disabled={!dirty} onClick={() => setF(saved)}>Cancel</button><button className="primary" disabled={!dirty || busy} onClick={save}>{busy ? 'Saving…' : 'Save Changes'}</button></div>}
    </section>
  </div>
}

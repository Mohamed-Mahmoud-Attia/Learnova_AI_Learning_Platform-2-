/** Login and Register pages. */
import { useState } from 'react'
import { api } from '../api'

type Props = { go: (page: 'login' | 'register' | 'dashboard') => void }

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const Spark = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" /></svg>
const Brand = () => <div className="auth-brand"><span className="brand-mark"><Spark /></span><span>learnova<span>.ai</span></span></div>

function Shell({ title, subtitle, footer, children }: { title: string; subtitle: string; footer: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-orbit" aria-hidden="true" />
        <Brand />
        <div className="auth-pitch">
          <span className="eyebrow light">AI LESSON STUDIO</span>
          <h2>Turn any PDF into a lesson that teaches you back.</h2>
          <ul>{['A narrated video lesson', 'Clear section summaries', 'Personalized knowledge check', 'A ready-to-study flashcard deck'].map((x, i) => <li key={x}><span>{i + 1}</span>{x}</li>)}</ul>
        </div>
        <small>© Learnova AI</small>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-switch">{footer}</p>
        </div>
      </main>
    </div>
  )
}

type FieldProps = { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; error?: string; hint?: string; autoComplete?: string }
function Field({ id, label, value, onChange, type = 'text', error, hint, autoComplete }: FieldProps) {
  const [show, setShow] = useState(false)
  const pass = type === 'password'
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-box">
        <input id={id} name={id} type={pass && show ? 'text' : type} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
        {pass && <button type="button" className="eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>}
      </div>
      {error ? <small id={`${id}-err`} className="field-err">{error}</small> : hint ? <small>{hint}</small> : null}
    </div>
  )
}

export function Login({ go }: Props) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('')
  const [errs, setErrs] = useState<{ email?: string; password?: string }>({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = { email: emailOk(email.trim()) ? undefined : 'Enter a valid email address.', password: password ? undefined : 'Enter your password.' }
    setErrs(v); setErr('')
    if (v.email || v.password) return
    setBusy(true)
    try { await api.login(email.trim(), password); go('dashboard') }
    catch (x) { setErr((x as Error).message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  return (
    <Shell title="Welcome back" subtitle="Sign in to continue learning." footer={<>New to Learnova? <button onClick={() => go('register')}>Create an account</button></>}>
      <form onSubmit={submit} noValidate>
        {err && <div className="form-error" role="alert">{err}</div>}
        <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errs.email} autoComplete="email" />
        <Field id="password" label="Password" type="password" value={password} onChange={setPassword} error={errs.password} autoComplete="current-password" />
        <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Shell>
  )
}

export function Register({ go }: Props) {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errs, setErrs] = useState<Partial<typeof f>>({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (v: string) => setF(x => ({ ...x, [k]: v }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v: Partial<typeof f> = {}
    if (!f.name.trim()) v.name = 'Enter your name.'
    if (!emailOk(f.email.trim())) v.email = 'Enter a valid email address.'
    if (f.password.length < 8) v.password = 'Use at least 8 characters.'
    if (!f.confirm) v.confirm = 'Confirm your password.'
    else if (f.confirm !== f.password) v.confirm = 'Passwords don’t match.'
    setErrs(v); setErr('')
    if (Object.keys(v).length) return
    setBusy(true)
    try { await api.register(f.name.trim(), f.email.trim(), f.password); go('dashboard') }
    catch (x) { setErr((x as Error).message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  return (
    <Shell title="Create your account" subtitle="Start turning your PDFs into lessons." footer={<>Already have an account? <button onClick={() => go('login')}>Sign in</button></>}>
      <form onSubmit={submit} noValidate>
        {err && <div className="form-error" role="alert">{err}</div>}
        <Field id="name" label="Full name" value={f.name} onChange={set('name')} error={errs.name} autoComplete="name" />
        <Field id="email" label="Email" type="email" value={f.email} onChange={set('email')} error={errs.email} autoComplete="email" />
        <Field id="password" label="Password" type="password" value={f.password} onChange={set('password')} error={errs.password} hint="At least 8 characters." autoComplete="new-password" />
        <Field id="confirm" label="Confirm password" type="password" value={f.confirm} onChange={set('confirm')} error={errs.confirm} autoComplete="new-password" />
        <button className="primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </Shell>
  )
}

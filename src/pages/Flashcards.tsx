/** Flashcards: flip cards, mark them known, shuffle the deck. */
import { useState } from 'react'
import { api, type Card } from '../api'
import type { Go } from '../lib/router'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load, toast } from '../components/ui'

const shuffle = (n: number) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
export function Flashcards({ go, id }: { go: Go; id: string }) {
  const q = useApi(() => api.flashcards(id), [id])
  return <Load q={q}>{cards => <Deck go={go} id={id} cards={cards}/>}</Load>
}
function Deck({ go, id, cards }: { go: Go; id: string; cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i)), [pos, setPos] = useState(0), [flipped, setFlipped] = useState(false), [known, setKnown] = useState<number[]>([])
  if (!cards.length) return <div className="empty card"><h2>No flashcards yet</h2><p>Create a lesson with “Quiz and Flashcards” turned on.</p><button className="secondary" onClick={() => go('upload')}>Create a lesson</button></div>
  const idx = order[pos], c = cards[idx], n = cards.length
  const move = (d: number) => { setFlipped(false); setPos(p => (p + d + n) % n) }
  const review = (yes: boolean) => { setKnown(k => yes ? [...new Set([...k, idx])] : k.filter(x => x !== idx)); api.reviewCard(id, idx, yes).catch(() => toast('Couldn’t save this card')); move(1) }
  return <div className="flash-page"><div className="hero-row"><div><span className="eyebrow">ACTIVE RECALL</span><h1>Flashcards</h1><p>Introduction to Artificial Intelligence · Core concepts</p></div><button className="secondary" onClick={() => go('library')}>Change lesson</button></div>
    <div className="deck-progress"><div><span>YOUR DECK</span><strong>{n} cards</strong></div><div><span>MASTERY</span><strong>{known.length} known</strong></div><div className="deck-bar"><i style={{ width: `${((pos + 1) / n) * 100}%` }}/></div><span>{pos + 1} / {n}</span></div>
    <button className={flipped ? 'flashcard flipped' : 'flashcard'} aria-label={flipped ? 'Show question' : 'Reveal answer'} onClick={() => setFlipped(!flipped)}><div className="flash-inner"><div className="flash-front"><span className="eyebrow">CONCEPT {String(pos + 1).padStart(2, '0')}</span><h2>{c.q}</h2><small>Click the card to reveal the answer</small></div><div className="flash-back"><span className="eyebrow">ANSWER</span><p>{c.a}</p><small>Click to see the question</small></div></div></button>
    <div className="flash-actions"><button className="secondary" onClick={() => review(false)}>Review Again</button><button className="primary" onClick={() => review(true)}><Icon name="check" size={17}/> Know It</button></div>
    <div className="flash-nav"><button onClick={() => move(-1)}><Icon name="back"/> Previous</button><button onClick={() => { setOrder(shuffle(n)); setPos(0); setFlipped(false); toast('Deck shuffled') }}>Shuffle deck</button><button onClick={() => move(1)}>Next <Icon name="arrow"/></button></div>
  </div>
}

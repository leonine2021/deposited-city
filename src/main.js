import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './style.css'
import { site, zones, works, details, coverLines } from './content.js'
import meta from './works-meta.json'
import * as scenes from './scenes.js'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const { reduced } = scenes
const base = import.meta.env.BASE_URL
const img = (id, kind = '') => `${base}works/${id}${kind ? `-${kind}` : ''}.webp`
const aspect = (id) => meta[id].w / meta[id].h

/** Both languages side by side; CSS shows the active one. */
const t = (o, tag = 'span', cls = '') =>
  `<${tag} class="zh ${cls}" lang="zh-Hans">${o.zh}</${tag}><${tag} class="en ${cls}" lang="en">${o.en}</${tag}>`

const quoted = (title) => ({ zh: `《${title.zh}》`, en: title.en })

/** Split text into animatable pieces: characters for Chinese, words for English. */
const pieces = (text, lang, cls) =>
  (lang === 'zh' ? [...text] : text.split(' '))
    .map((s) => `<span class="${cls}">${s}</span>`)
    .join(lang === 'zh' ? '' : ' ')

const lines = (o, cls) =>
  ['zh', 'en']
    .map(
      (l) =>
        `<span class="${l}" lang="${l === 'zh' ? 'zh-Hans' : 'en'}">${o[l]
          .map((line) => `<span class="line">${pieces(line, l, cls)}</span>`)
          .join('')}</span>`,
    )
    .join('')

const split = (o, cls) =>
  `<span class="zh" lang="zh-Hans">${pieces(o.zh, 'zh', cls)}</span><span class="en" lang="en">${pieces(o.en, 'en', cls)}</span>`

/* ---------------------------------------------------------------- markup */

function figure(w, extra = '') {
  const m = meta[w.id]
  return `<figure class="work${m.pending ? ' is-pending' : ''}" data-id="${w.id}" ${extra}>
    <img src="${img(w.id)}" width="${m.w}" height="${m.h}" alt="${w.title.en}, Wenlu Guo" decoding="async" loading="lazy" />
    ${m.pending ? `<span class="work__pending">${t(site.pendingWork)}</span>` : ''}
  </figure>`
}

function label(w) {
  return `<div class="label">
    <span class="label__no">${w.id}</span>
    <span class="label__title">${t(quoted(w.title))}</span>
    <span class="label__medium">${t(w.medium)}</span>
    ${w.note ? `<span class="label__note">${t(w.note)}</span>` : ''}
  </div>`
}

/**
 * The walk: one screen, one work, in one flowing sequence set by the artist
 * rather than zone by zone. Two ways of showing a work, by what it is, and
 * each work is shown in one of them only:
 *
 * - a chapter may also open on a whole work (`whole` with `chapter`): its
 *   number, name and quotation stand on the wall beside the work, then give
 *   way to the work's label;
 * - the abstract prints (strokes, grooves, salt, rust) are `cover`s: the
 *   artist's own crop of the print fills the screen as the ground for a
 *   line of text, edges falling into the wall, then gives way to the work's
 *   label. The first cover of each zone carries the zone's number, name and
 *   theme line and is followed by the zone's wall text (`chapter`); the
 *   others carry one sentence from that text (`line`);
 * - the figurative prints (a tower, a facade, a figure) are shown whole,
 *   filling the screen as far as they can without cropping, never up close
 *   (`whole`). The line choreographies (trace, push, sag, saltline...) stay
 *   in scenes.js but are not used: the walk is pictures and words only.
 *
 * The kind names a choreography in scenes.js. The bar's zone name follows
 * the work on screen.
 */
// seven works, few and chosen, so the walk never tires the eye on a screen.
// From the concrete to the abstract: the three figurative prints first, whole,
// so a visitor can read them at once; then the abstract regions, where lines
// are tied to what made them. Three chapters of two or three works each:
// drawn (the city drawn, and lines slipping out of it), pressed (hard things
// pressed or scored into another material: contact, friction), deposited
// (water and absence). Scored land (03) sits next to water (10, 13).
const choreography = [
  { kind: 'whole', ids: ['01'], chapter: true },
  { kind: 'whole', ids: ['05'] },
  { kind: 'whole', ids: ['02'] },
  { kind: 'cover', ids: ['06'], chapter: true },
  { kind: 'cover', ids: ['03'] },
  { kind: 'cover', ids: ['10'], chapter: true },
  { kind: 'cover', ids: ['13'] },
  // the ending: the mask answers the opening question
  { kind: 'cover', ids: ['08'] },
]

const REGION = new Set(['detail', 'cover'])
const beatId = (beat) => `${REGION.has(beat.kind) ? 'detail' : 'beat'}-${beat.ids.join('-')}`

/* works shown only as a region; nothing on the site shows them whole */
const detailOnly = new Set(['00', ...choreography.filter((b) => REGION.has(b.kind)).flatMap((b) => b.ids)])

const workById = Object.fromEntries(works.map((w) => [w.id, w]))
const SALT_KINDS = new Set(['crystallize', 'saltline', 'evaporate', 'drift'])

/** The region of a work, edge to edge; its text sits in a band beneath. */
function detailFigure(id, extra = '') {
  const w = workById[id]
  const d = meta[id].detail
  return `<figure class="detail" data-id="${id}" ${extra}>
    <img src="${img(id, 'detail')}" width="${d.w}" height="${d.h}" alt="${w.title.en}, detail, Wenlu Guo" decoding="async" ${id === '00' ? '' : 'loading="lazy"'} />
  </figure>`
}

function detailScene(beat) {
  const [id] = beat.ids
  const w = workById[id]
  return `<section class="scene scene--detail" id="${beatId(beat)}">
    <div class="stage">
      ${detailFigure(id)}
      ${beat.salt ? '<canvas class="salt" aria-hidden="true"></canvas>' : ''}
      <div class="veil" aria-hidden="true"></div>
      <div class="detail__meta">
        <div class="detail__text">
          <span class="label__no">${t(site.detail)} · ${id}</span>
          <span class="label__title">${t(quoted(w.title))}</span>
          <span class="label__medium">${t(w.medium)}</span>
          ${details[id] ? t(details[id], 'p', 'detail__caption') : ''}
        </div>
      </div>
    </div>
  </section>`
}

/** A zone's cover: its first region fills the screen under the zone's number, name and theme line. */
function coverScene(beat) {
  const [id] = beat.ids
  const w = workById[id]
  const z = zones[w.zone]
  const center = beat.chapter
    ? `<span class="cover__numeral">${t(z.numeral)}</span>
        <h2 class="cover__name">${t(z.name)}</h2>
        <p class="cover__theme">${t(z.theme)}</p>
        ${z.themeBy ? `<span class="cover__by">${t(z.themeBy)}</span>` : ''}`
    : `<p class="cover__theme cover__theme--alone">${t(coverLines[id] ?? z.theme)}</p>
        ${coverLines[id]?.by ? `<span class="cover__by">${t(coverLines[id].by)}</span>` : ''}`
  return `<section class="cover scene" id="${beatId(beat)}">
    <div class="stage">
      ${detailFigure(id, 'aria-hidden="true"')}
      <div class="veil" aria-hidden="true"></div>
      <div class="scrim" aria-hidden="true"></div>
      <svg class="ink" aria-hidden="true"></svg>
      <div class="cover__center">
        ${center}
      </div>
      <div class="cover__after label">
        <span class="label__no">${t(site.detail)} · ${id}</span>
        <span class="label__title">${t(quoted(w.title))}</span>
        <span class="label__medium">${t(w.medium)}</span>
        ${details[id] ? t(details[id], 'p', 'detail__caption') : ''}
      </div>
    </div>
  </section>`
}

/** The zone's number, name and quotation, set on the wall beside a whole work before its label. */
function chapterHead(w) {
  const z = zones[w.zone]
  return `<div class="whole__chapter">
    <span class="cover__numeral">${t(z.numeral)}</span>
    <h2 class="whole__name">${t(z.name)}</h2>
    <p class="whole__theme">${t(z.theme)}</p>
    ${z.themeBy ? `<span class="cover__by">${t(z.themeBy)}</span>` : ''}
  </div>`
}

function beatScene(beat) {
  if (beat.kind === 'cover') return coverScene(beat)
  if (beat.kind === 'detail') return detailScene(beat)
  if (beat.kind === 'whole') {
    const [w] = beat.ids.map((id) => workById[id])
    return `<section class="scene scene--whole" id="${beatId(beat)}">
      <div class="stage">${figure(w)}${beat.chapter ? chapterHead(w) : ''}${label(w)}</div>
    </section>`
  }
  const ws = beat.ids.map((id) => workById[id])
  const layer = SALT_KINDS.has(beat.kind)
    ? '<canvas class="salt" aria-hidden="true"></canvas>'
    : '<svg class="ink" aria-hidden="true"></svg>'
  const items = ws.map((w) => figure(w) + label(w)).join('')
  return `<section class="scene scene--${beat.kind}" id="${beatId(beat)}">
    <div class="stage">${layer}${beat.kind === 'drift' ? `<div class="track">${items}</div>` : items}</div>
  </section>`
}

const SAMPLE = {
  drawn: '<path fill="none" pathLength="1" d="M0 20H320"/>',
  pressed: '<path fill="none" pathLength="1" d="M0 20H118C146 20 150 33 172 33S198 20 226 20H320"/>',
  deposited: (() => {
    let s = 7
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 46 }, (_, i) => {
      const x = (i / 45) * 320
      return `<circle cx="${x.toFixed(1)}" cy="${(20 + (r() - 0.5) * 7).toFixed(1)}" r="${(0.6 + r() * 1.7).toFixed(2)}"/>`
    }).join('')
  })(),
}

function intro(key) {
  const z = zones[key]
  if (!z.body && !z.epigraph) return ''
  return `<section class="intro" data-sample="${key}">
    <div class="intro__head reveal">
      <svg class="intro__sample" viewBox="0 0 320 40" preserveAspectRatio="xMinYMid meet" aria-hidden="true"
        fill="currentColor" stroke="currentColor" stroke-width="1.25" stroke-linecap="round">${SAMPLE[key]}</svg>
      ${
        z.epigraph
          ? `<blockquote class="epigraph">${t(z.epigraph, 'p')}<cite>${t(z.epigraphBy)}</cite></blockquote>`
          : ''
      }
      ${z.body ? t(z.body, 'p', 'intro__body') : ''}
    </div>
  </section>`
}

/** The walk: each beat wrapped in its work's zone; a chapter cover is followed by the zone's wall text. */
function walk() {
  return choreography
    .map((beat) => {
      const key = workById[beat.ids[0]].zone
      return zone(key, beatScene(beat) + (beat.chapter ? intro(key) : ''))
    })
    .join('')
}

function zone(key, inner) {
  return `<div class="zone" data-zone="${key}">${inner}</div>`
}

const cover = works[0]

document.querySelector('#app').innerHTML = `
<header class="bar">
  <a class="bar__home" href="#top">${t(site.short)}</a>
  <span class="bar__zone" aria-live="polite"></span>
  <div class="bar__tools">
    <button class="bar__theme" type="button" aria-label="Switch light or dark / 切换浅色或深色">
      <svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
      <svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>
    </button>
    <button class="bar__lang" type="button" aria-label="Switch language / 切换语言"></button>
  </div>
  <span class="bar__progress"></span>
</header>

<main>
  ${zone(
    'prologue',
    `<section class="cover hero scene" id="top">
      <div class="stage">
        ${detailFigure('00', 'aria-hidden="true"')}
        <div class="veil" aria-hidden="true"></div>
        <div class="scrim" aria-hidden="true"></div>
        <svg class="ink" aria-hidden="true"></svg>
        <div class="cover__center">
          <h1 class="hero__title">${lines(site.titleLines, 'char')}</h1>
          <p class="hero__sub">${t(site.subtitle)}</p>
        </div>
        <div class="cover__after label" id="work-00" data-id="00">
          ${t(site.prologue, 'p', 'prologue__line')}
          <span class="label__no">00</span>
          <span class="label__title">${t(quoted(cover.title))}</span>
          <span class="label__medium">${t(cover.medium)}</span>
        </div>
        <div class="hero__cue">${t(site.scroll)}</div>
      </div>
    </section>

    <section class="statement"><p>${split(site.thesis, 'piece')}</p></section>

    <section class="preface"><div class="prose reveal">${t(site.preface, 'p')}</div></section>`,
  )}

  ${walk()}
  ${zone(
    'coda',
    `<section class="exit" id="exit">
      <button class="exit__back" type="button">${t(site.exit.back)}</button>
    </section>`,
  )}

  <footer class="index">
    <h2>${t(site.index)}</h2>
    <ol>${works
      .map(
        (w) => `<li><button type="button" data-goto="${w.id}">
          <b>${w.id}</b><span class="meta">${t(quoted(w.title))}${detailOnly.has(w.id) ? `<i>${t(site.detail)}</i>` : ''}</span>
        </button></li>`,
      )
      .join('')}</ol>
    <p class="credit">${t(site.credit)}</p>
  </footer>
</main>`

/* ---------------------------------------------------------------- scroll */

const lenis = reduced ? null : new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function scrollToY(y, duration = 1.6) {
  if (lenis) lenis.scrollTo(y, { duration, easing: (x) => 1 - Math.pow(1 - x, 4) })
  else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
}

/* ---------------------------------------------------------------- scenes */

const triggers = {}
triggers['00'] = scenes.cover(document.querySelector('.hero'), { hero: true }).st
for (const beat of choreography) {
  const el = document.querySelector(`#${beatId(beat)}`)
  const seed = Number(beat.ids[0]) * 7919
  const scene =
    beat.kind === 'cover'
      ? scenes.cover(el)
      : beat.kind === 'detail'
        ? scenes.detail(el, beat, seed)
        : scenes[beat.kind](el, beat.ids.map(aspect), seed, beat)
  for (const id of beat.ids) triggers[id] = scene.st
}

/* works often start off-stage (sliding or dropping in), where lazy loading would
   only fetch them at the last moment; start loading each beat well ahead */
for (const el of document.querySelectorAll('.scene')) {
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom+=150%',
    once: true,
    onEnter: () => el.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')),
  })
}

/* statement: the sentence darkens piece by piece as it scrolls through */
for (const group of document.querySelectorAll('.statement .zh, .statement .en')) {
  if (reduced) break
  gsap.to(group.querySelectorAll('.piece'), {
    opacity: 1,
    ease: 'none',
    stagger: 0.1,
    scrollTrigger: { trigger: '.statement', start: 'top 70%', end: 'bottom 55%', scrub: 0.5 },
  })
}

/* blocks of text rise in once */
for (const el of document.querySelectorAll('.reveal')) {
  if (reduced) break
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 86%', once: true },
  })
}

/* zone samples: the line kind of each zone draws itself */
for (const svg of document.querySelectorAll('.intro__sample')) {
  if (reduced) break
  const path = svg.querySelector('path')
  const tl = { scrollTrigger: { trigger: svg, start: 'top 82%', once: true } }
  if (path) {
    gsap.fromTo(path, { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', ...tl })
  } else {
    gsap.from(svg.querySelectorAll('circle'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.025, ...tl })
  }
}

/* header: current zone name and reading progress */
const zoneLabel = document.querySelector('.bar__zone')
let currentZone = null
function showZone(key) {
  currentZone = key
  zoneLabel.innerHTML = key ? t(zones[key].name) : ''
}
for (const el of document.querySelectorAll('.zone')) {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle(self) {
      if (self.isActive) showZone(el.dataset.zone)
      else if (currentZone === el.dataset.zone) showZone(null)
    },
  })
}
const progress = document.querySelector('.bar__progress')
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => (progress.style.transform = `scaleX(${self.progress})`),
})

/* ---------------------------------------------------------------- language */

const langButton = document.querySelector('.bar__lang')
function applyLang(lang) {
  const root = document.documentElement
  root.dataset.lang = lang
  root.lang = lang === 'zh' ? 'zh-Hans' : 'en'
  langButton.textContent = lang === 'zh' ? 'EN' : '中文'
  document.title = lang === 'zh' ? `${site.title.zh} · ${site.title.en}` : `${site.title.en} · ${site.title.zh}`
}
applyLang(document.documentElement.dataset.lang === 'en' ? 'en' : 'zh')
langButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.lang === 'zh' ? 'en' : 'zh'
  applyLang(next)
  try {
    localStorage.setItem('lang', next)
  } catch {
    // storage unavailable (private mode); the choice simply is not remembered
  }
  if (currentZone) showZone(currentZone)
  ScrollTrigger.refresh()
})

/* ---------------------------------------------------------------- theme */

const themeMeta = document.querySelector('meta[name="theme-color"]')
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  themeMeta.content = theme === 'dark' ? '#131312' : '#f4f2ed'
  // canvases read their salt colours on layout; refresh re-lays out every scene
  ScrollTrigger.refresh()
}
themeMeta.content = document.documentElement.dataset.theme === 'dark' ? '#131312' : '#f4f2ed'
document.querySelector('.bar__theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  try {
    localStorage.setItem('theme', next)
  } catch {
    // storage unavailable; the choice lasts for this visit only
  }
})

/* ---------------------------------------------------------------- navigation */

const revealedY = (st) => st.start + (st.end - st.start) * 0.95
document.querySelector('.bar__home').addEventListener('click', (e) => {
  e.preventDefault()
  scrollToY(0, 2)
})
document.querySelector('.exit__back').addEventListener('click', () => scrollToY(0, 2.6))
for (const btn of document.querySelectorAll('[data-goto]')) {
  btn.addEventListener('click', () => {
    const st = triggers[btn.dataset.goto]
    if (st) scrollToY(revealedY(st), 2)
    else document.querySelector(`[data-id="${btn.dataset.goto}"]`)?.scrollIntoView({ block: 'center' })
  })
}

/* fonts change text metrics; re-measure once they arrive */
document.fonts?.ready.then(() => ScrollTrigger.refresh())

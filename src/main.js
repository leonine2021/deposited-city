import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './style.css'
import { site, zones, works } from './content.js'
import meta from './works-meta.json'
import * as scenes from './scenes.js'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const { reduced } = scenes
const base = import.meta.env.BASE_URL
const img = (id, thumb = false) => `${base}works/${id}${thumb ? '-thumb' : ''}.webp`
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
  return `<figure class="work" data-id="${w.id}" ${extra}>
    <img src="${img(w.id)}" width="${m.w}" height="${m.h}" alt="${w.title.en}, Wenlu Guo" decoding="async" ${w.id === '00' ? '' : 'loading="lazy"'} />
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

function workScene(w) {
  const layer = w.zone === 'deposited' ? '<canvas class="salt" aria-hidden="true"></canvas>' : '<svg class="ink" aria-hidden="true"></svg>'
  return `<section class="scene scene--${w.zone}" id="work-${w.id}" data-id="${w.id}">
    <div class="stage">${layer}${figure(w)}${label(w)}</div>
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
  return `<section class="intro" data-sample="${key}">
    <div class="intro__head reveal">
      <span class="intro__numeral">${t(z.numeral)}</span>
      <h2 class="intro__name">${t(z.name)}</h2>
      <svg class="intro__sample" viewBox="0 0 320 40" preserveAspectRatio="xMinYMid meet" aria-hidden="true"
        fill="currentColor" stroke="currentColor" stroke-width="1.25" stroke-linecap="round">${SAMPLE[key]}</svg>
      ${t(z.body, 'p', 'intro__body')}
    </div>
  </section>`
}

function zone(key, inner) {
  return `<div class="zone" data-zone="${key}">${inner}</div>`
}

const byZone = (z) => works.filter((w) => w.zone === z)
const cover = works[0]

document.querySelector('#app').innerHTML = `
<header class="bar">
  <a class="bar__home" href="#top">${t(site.short)}</a>
  <span class="bar__zone" aria-live="polite"></span>
  <button class="bar__lang" type="button" aria-label="Switch language / 切换语言"></button>
  <span class="bar__progress"></span>
</header>

<main>
  <section class="hero" id="top">
    <div class="stage">
      <svg class="ink" aria-hidden="true"></svg>
      <div class="hero__center">
        <h1 class="hero__title">${lines(site.titleLines, 'char')}</h1>
        <p class="hero__sub">${t(site.subtitle)}</p>
      </div>
      <div class="hero__cue">${t(site.scroll)}</div>
    </div>
  </section>

  <section class="statement"><p>${split(site.thesis, 'piece')}</p></section>

  <section class="preface"><div class="prose reveal">${t(site.preface, 'p')}</div></section>

  ${zone(
    'prologue',
    `<section class="scene scene--prologue" id="work-00" data-id="00">
      <div class="stage">
        <svg class="ink" aria-hidden="true"></svg>
        ${figure(cover)}
        <div class="label">
          ${t(site.prologue, 'p', 'prologue__line')}
          <span class="label__title">${t(quoted(cover.title))}</span>
          <span class="label__medium">${t(cover.medium)}</span>
        </div>
      </div>
    </section>`,
  )}

  ${zone('drawn', intro('drawn') + byZone('drawn').map(workScene).join(''))}
  ${zone('pressed', intro('pressed') + byZone('pressed').map(workScene).join(''))}

  ${zone('deposited', intro('deposited') + byZone('deposited').map(workScene).join(''))}
  ${zone(
    'synthesis',
    `<section class="scene scene--synthesis" id="synthesis">
      <div class="stage">
        <canvas class="salt" aria-hidden="true"></canvas>
        <svg class="ink" aria-hidden="true"></svg>
        <figure class="work vignette" aria-label="${site.synthesis.title.en}">${t(site.synthesis.pending)}</figure>
      </div>
    </section>
    <section class="synthesis-text">
      <div class="prose reveal">
        <span class="kicker">${t(site.synthesis.kicker)}</span>
        <h2>${t(site.synthesis.title)}</h2>
        ${t(site.synthesis.body, 'p')}
        <span class="label__medium">${t(site.synthesis.label)}</span>
      </div>
    </section>`,
  )}

  ${zone(
    'coda',
    `<section class="coda">
      <div class="prose reveal">
        <span class="kicker">${t(site.coda.kicker)}</span>
        <h2>${t(site.coda.line)}</h2>
        <ol>${site.coda.objects.map((o, i) => `<li><b>0${i + 1}</b>${t(o)}</li>`).join('')}</ol>
      </div>
    </section>
    <section class="scene scene--exit" id="exit">
      <div class="stage">
        <svg class="ink" aria-hidden="true"></svg>
        ${figure(cover, 'aria-hidden="true"').replace('loading="lazy"', '')}
        ${t(site.exit.line, 'p', 'exit__line')}
        <button class="exit__back" type="button">${t(site.exit.back)}</button>
      </div>
    </section>`,
  )}

  <footer class="index">
    <h2>${t(site.index)}</h2>
    <ol>${works
      .map(
        (w) => `<li><button type="button" data-goto="${w.id}">
          <span class="thumb"><img src="${img(w.id, true)}" alt="" loading="lazy" decoding="async" /></span>
          <span class="meta"><b>${w.id}</b>${t(quoted(w.title))}</span>
        </button></li>`,
      )
      .join('')}</ol>
    <p class="credit">${t(site.credit)}</p>
  </footer>
</main>

<div class="lightbox" hidden>
  <img alt="" />
  <button class="lightbox__close" type="button" aria-label="Close">×</button>
</div>`

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
scenes.hero(document.querySelector('.hero'))
triggers['00'] = scenes.prologue(document.querySelector('#work-00'), aspect('00')).st

let pressedCount = 0
for (const w of works.slice(1)) {
  const el = document.querySelector(`#work-${w.id}`)
  let scene
  if (w.zone === 'drawn') scene = scenes.drawn(el, aspect(w.id))
  else if (w.zone === 'pressed') scene = scenes.pressed(el, aspect(w.id), pressedCount++ % 2 ? 'right' : 'left')
  else scene = scenes.deposited(el, aspect(w.id), Number(w.id) * 7919)
  triggers[w.id] = scene.st
}
scenes.synthesis(document.querySelector('#synthesis'))
scenes.exit(document.querySelector('#exit'), aspect('00'))

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
    else document.querySelector(`#work-${btn.dataset.goto}`).scrollIntoView()
  })
}

/* ---------------------------------------------------------------- lightbox */

const box = document.querySelector('.lightbox')
const boxImg = box.querySelector('img')
function openBox(id) {
  const w = works.find((x) => x.id === id)
  boxImg.src = img(id)
  boxImg.alt = `${w.title.en}, Wenlu Guo`
  box.hidden = false
  requestAnimationFrame(() => box.classList.add('is-open'))
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}
function closeBox() {
  box.classList.remove('is-open')
  lenis?.start()
  document.documentElement.style.overflow = ''
  setTimeout(() => (box.hidden = true), 350)
}
for (const fig of document.querySelectorAll('.work[data-id]')) {
  if (fig.closest('#exit')) continue
  fig.addEventListener('click', () => openBox(fig.dataset.id))
}
box.addEventListener('click', closeBox)
document.addEventListener('keydown', (e) => e.key === 'Escape' && !box.hidden && closeBox())

/* fonts change text metrics; re-measure once they arrive */
document.fonts?.ready.then(() => ScrollTrigger.refresh())

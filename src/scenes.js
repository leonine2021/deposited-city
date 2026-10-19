// Scroll-driven scenes. Each scene pins its section for a stretch of scroll and
// maps scroll progress p (0 to 1) onto a pure render(p), so scrolling back
// plays everything in reverse, as on Apple product pages.
//
// The line is the protagonist. Each zone keeps one logic for how the line
// meets the work, but varies the beat (one work, a pair, a run of three) and
// borrows the architect's drawing types so the walk never repeats itself.
//
// One screen, one work, as large as the stage allows.
//
// cover       a region fills the screen as the ground for a title: the sealed
//             plate under the exhibition title at the entrance, each zone's
//             first region under the zone's number, name and theme line; the
//             title gives way to the work's label, and the line descends
// detail      an abstract work is shown only as one region at scan
//             resolution, edge to edge; in the deposited zone, salt grains
//             scattered over it settle into a line beneath
// drawn       trace: one frame ruled around a whole work (mode 'frame') or a
//             ground line from which it rises with a dimension beside it
//             (mode 'rise')
// pressed     push: a work slides in from one side and bends the line aside
//             · sag: a work drops onto a level line and presses a hollow
// deposited   crystallize: grains settle around a work · saltline: grains
//             fall into the wall's salt line beneath it
// synthesis   the grains regather into the river's axis
// exit        the sealed plate's region returns with a waterline across it
//
// plan, elevation, pinch, evaporate, drift (pairs and runs) are kept below
// for reference; the walk no longer uses them.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const TAU = Math.PI * 2
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const lerp = (a, b, t) => a + (b - a) * t
const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  // ease in and out with a small overshoot at the end, like a spring settling
  backInOut: (t) => {
    const c = 1.2 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
  },
}

const barHeight = () => document.querySelector('.bar')?.offsetHeight ?? 52

/* ------------------------------------------------------------- layout */

function stageBox(stage) {
  const W = stage.clientWidth
  return { W, H: stage.clientHeight, top: barHeight(), cx: W / 2 }
}

/** Fit one work of the given aspect (w/h) centred in the stage, leaving room below for its label. */
function fit(stage, aspect, { maxW = 680, maxHRatio = 0.7, below = 112 } = {}) {
  const s = stageBox(stage)
  const room = s.H - s.top - below - 32
  const maxH = Math.min(s.H * maxHRatio, room)
  let w = Math.min(s.W - 48, maxW)
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  const x = (s.W - w) / 2
  const y = s.top + 16 + (room - h) / 2
  return { ...s, x, y, w, h, r: x + w, b: y + h }
}

/**
 * Two works in staggered rows, the first against the left margin and the
 * second against the right, each with its label on the open side. Reads like
 * a magazine spread and breaks the centred single-work rhythm.
 */
function rows(stage, aspects) {
  const s = stageBox(stage)
  const contentW = Math.min(s.W - 48, 920)
  const left = (s.W - contentW) / 2
  const gap = 40
  const rowH = (s.H - s.top - 32 - gap) / 2
  const boxes = aspects.map((a, i) => {
    const w = Math.min(contentW * 0.55, rowH * a)
    const h = w / a
    const x = i % 2 === 0 ? left : left + contentW - w
    const y = s.top + 16 + i * (rowH + gap) + (rowH - h) / 2
    return { x, y, w, h, r: x + w, b: y + h, side: i % 2 === 0 ? 'left' : 'right' }
  })
  return { ...s, left, contentW, boxes }
}

function place(fig, b) {
  Object.assign(fig.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` })
}

function placeBelow(el, b, gap = 22) {
  el.classList.remove('label--side')
  Object.assign(el.style, { left: 'var(--gutter)', right: 'var(--gutter)', width: '', textAlign: '', top: `${b.b + gap}px` })
}

/** Label beside a work in a row layout, bottom-aligned with it like a wall label. */
function placeSide(el, box, L, inset = 22) {
  el.classList.add('label--side')
  Object.assign(el.style, {
    left: `${box.side === 'left' ? box.r + inset : L.left}px`,
    right: 'auto',
    width: `${L.contentW - box.w - inset}px`,
    textAlign: box.side === 'left' ? 'left' : 'right',
  })
  el.style.top = `${box.b - el.offsetHeight}px`
}

/**
 * A work as large as the stage allows. On a wide stage it stands edge to
 * edge in height with its label beside it on the wall; on a narrow one it
 * fills the width with the label beneath.
 */
function fitBig(stage, aspect) {
  const s = stageBox(stage)
  if (s.W > s.H * 1.05) {
    const room = s.H - s.top - 48
    const w = Math.min(room * aspect, s.W * 0.62)
    const h = w / aspect
    const x = (s.W - w) / 2
    const y = s.top + 24 + (room - h) / 2
    return { ...s, x, y, w, h, r: x + w, b: y + h, wide: true }
  }
  return { ...fit(stage, aspect, { maxW: 9999, maxHRatio: 0.78, below: 120 }), wide: false }
}

/** Label on the wall beside a large work, bottom-aligned with it. */
function placeBeside(el, b, side = 'left') {
  const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24
  el.classList.add('label--side')
  const width = Math.max(120, b.x - 32 - gutter)
  Object.assign(el.style, {
    left: side === 'left' ? `${gutter}px` : `${b.r + 32}px`,
    right: 'auto',
    width: `${width}px`,
    textAlign: side === 'left' ? 'right' : 'left',
  })
  el.style.top = `${b.b - el.offsetHeight}px`
}

/**
 * A whole work as large as the screen allows without cropping: from the bar
 * to the bottom edge on a wide screen (label on the wall beside it), the
 * full width on a narrow one (label beneath).
 */
function fitFull(stage, aspect) {
  const s = stageBox(stage)
  const room = s.H - s.top
  if (s.W > s.H * 1.05) {
    let h = room
    let w = h * aspect
    const maxW = s.W - 2 * 200
    if (w > maxW) {
      w = maxW
      h = w / aspect
    }
    const x = (s.W - w) / 2
    const y = s.top + (room - h) / 2
    return { ...s, x, y, w, h, r: x + w, b: y + h, wide: true }
  }
  let w = s.W
  let h = w / aspect
  const maxH = room - 120
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  const x = (s.W - w) / 2
  const y = s.top
  return { ...s, x, y, w, h, r: x + w, b: y + h, wide: false }
}

/** Beside the work on a wide stage, beneath it on a narrow one. */
function placeLabel(el, b, side = 'left') {
  if (b.wide) placeBeside(el, b, side)
  else placeBelow(el, b)
}

function fade(el, o, dy = 14) {
  el.style.opacity = o
  el.style.transform = `translate3d(0,${(1 - o) * dy}px,0)`
  el.style.pointerEvents = o > 0.5 ? '' : 'none'
}

function viewBox(svg, b) {
  svg.setAttribute('viewBox', `0 0 ${b.W} ${b.H}`)
}

const rectPath = (b) => `M${b.x + b.w / 2} ${b.y}H${b.r}V${b.b}H${b.x}V${b.y}Z`

/** Elements a scene works with, in markup order. */
function parts(section) {
  const stage = section.querySelector('.stage')
  return {
    stage,
    svg: stage.querySelector('.ink'),
    canvas: stage.querySelector('.salt'),
    figs: [...stage.querySelectorAll('.work')],
    labels: [...stage.querySelectorAll('.label')],
  }
}

/* -------------------------------------------------------------- engine */

/**
 * Pin `section` for `length` viewport heights of scroll and drive render(p).
 * Returns the ScrollTrigger (null when motion is reduced) and a redraw function.
 */
function pinScene(section, { length, layout, render }) {
  const state = { p: reduced ? 1 : 0 }
  const draw = () => render(state.p)
  const relayout = () => {
    layout()
    draw()
  }
  relayout()
  ScrollTrigger.addEventListener('refresh', relayout)
  if (reduced) return { st: null, draw }
  const tween = gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: draw,
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * length}`,
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
    },
  })
  return { st: tween.scrollTrigger, draw }
}

/**
 * A full-stage canvas that only holds pixels while its scene is near the
 * viewport, so the salt scenes never all sit in memory at once.
 */
function saltCanvas(canvas, scene, getBox) {
  const ctx = canvas.getContext('2d')
  const api = {
    active: reduced,
    ctx,
    size() {
      const b = getBox()
      if (!api.active || !b) {
        canvas.width = canvas.height = 0
        return
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(b.W * dpr)
      canvas.height = Math.round(b.H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
  }
  if (scene.st) {
    ScrollTrigger.create({
      start: () => scene.st.start - window.innerHeight,
      end: () => scene.st.end + window.innerHeight,
      onToggle(self) {
        api.active = self.isActive
        api.size()
        scene.draw()
      },
    })
  }
  return api
}

/** Wire a canvas scene: build it, attach its salt canvas, size and draw once. */
function withSalt(section, canvas, config, getBox) {
  const holder = {}
  const scene = pinScene(section, {
    length: config.length,
    layout() {
      config.layout()
      holder.salt?.size()
      holder.colors = saltColors()
    },
    render: (p) => config.render(p, holder.salt?.active ? holder : null),
  })
  holder.salt = saltCanvas(canvas, scene, getBox)
  holder.salt.size()
  scene.draw()
  return scene
}

/* ---------------------------------------------------------------- salt */

// deterministic randomness so every visitor sees the same salt
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(TAU * r())
}

/** Point on the rectangle's perimeter at fraction u, clockwise from top-left, with outward normal. */
function perimeter(b, u) {
  let d = (((u % 1) + 1) % 1) * 2 * (b.w + b.h)
  if (d < b.w) return [b.x + d, b.y, 0, -1]
  d -= b.w
  if (d < b.h) return [b.r, b.y + d, 1, 0]
  d -= b.h
  if (d < b.w) return [b.r - d, b.b, 0, 1]
  d -= b.w
  return [b.x, b.b - d, -1, 0]
}

function makeSalt(seed, n) {
  const r = rng(seed)
  const clusters = Array.from({ length: 9 }, () => r())
  return Array.from({ length: n }, (_, i) => {
    const clustered = r() < 0.62
    const big = r() < 0.05
    return {
      i,
      line: i / n,
      jx: (r() - 0.5) * 2.2,
      sx: 0.06 + r() * 0.88,
      sy: 0.04 + r() * 0.92,
      u: clustered ? clusters[Math.floor(r() * clusters.length)] + gauss(r) * 0.014 : r(),
      out: 1.5 + Math.abs(gauss(r)) * (clustered ? 6 : 3.5),
      r: big ? 2.6 + r() * 1.4 : clustered ? 0.8 + r() * 1.8 : 0.5 + r() * 0.9,
      a: 0.5 + r() * 0.45,
      n: gauss(r),
      delay: r(),
    }
  })
}

/**
 * One grain of salt on paper: small grains are graphite specks; larger ones are
 * drawn as crystals, a paper-white core with a fine rim, like the salt blooms
 * in the prints themselves.
 */
function dot(ctx, colors, x, y, radius, alpha) {
  if (radius <= 0.05 || alpha <= 0.01) return
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, TAU)
  if (radius < 1.7) {
    ctx.fillStyle = colors.grain
    ctx.fill()
    return
  }
  ctx.fillStyle = colors.paper
  ctx.fill()
  ctx.strokeStyle = colors.grain
  ctx.lineWidth = 0.75
  ctx.stroke()
}

function saltColors() {
  const css = getComputedStyle(document.documentElement)
  return {
    grain: css.getPropertyValue('--grain').trim() || '#6e695f',
    paper: css.getPropertyValue('--paper').trim() || '#f4f2ed',
    water: css.getPropertyValue('--water').trim() || '#4d7891',
  }
}

/** Where a grain sits on the vertical salt line every deposited scene starts from. */
const onLine = (g, b) => [b.cx + g.jx, lerp(b.top, b.H, g.line)]

/* ---------------------------------------------------------- framing */

/**
 * A cover: a region fills the screen as the ground for a title. The region
 * surfaces out of the veil; the title gives way to the work's own label;
 * the line descends through the image. The entrance (hero) also plays its
 * title in on load.
 */
export function cover(section, { hero = false } = {}) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.detail')
  const im = fig.querySelector('img')
  const veil = stage.querySelector('.veil')
  const center = stage.querySelector('.cover__center')
  const after = stage.querySelector('.cover__after')
  const cue = stage.querySelector('.hero__cue')
  svg.innerHTML = '<path/>'
  const line = svg.firstChild
  const intro = { t: reduced || !hero ? 1 : 0 }
  let b

  const scene = pinScene(section, {
    length: 1.6,
    layout() {
      b = stageBox(stage)
      viewBox(svg, b)
    },
    render(p) {
      // the plate surfaces, then the title gives way to the work's label
      const o = hero ? ease.out(intro.t) : ease.out(seg(p, 0, 0.3))
      fig.style.opacity = o
      im.style.transform = `scale(${1.08 - 0.08 * o})`
      veil.style.opacity = 1 - 0.55 * ease.inOut(seg(p, 0.1, 0.5))
      const out = ease.inOut(seg(p, 0.3, 0.5))
      if (!hero) {
        const inn = ease.out(seg(p, 0.04, 0.26))
        center.style.opacity = Math.min(inn, 1 - out)
        center.style.transform = `translate3d(0,${(1 - inn) * 24 - out * 40}px,0)`
      } else {
        center.style.opacity = 1 - out
        center.style.transform = `translate3d(0,${-out * 40}px,0)`
      }
      center.style.pointerEvents = out > 0.5 ? 'none' : ''
      fade(after, seg(p, 0.54, 0.7))
      if (cue) cue.style.opacity = 1 - seg(p, 0, 0.12)
      const y = lerp(b.top, b.H + 2, ease.inOut(seg(p, 0.56, 1)))
      line.setAttribute('d', y - b.top > 0.5 ? `M${b.cx} ${b.top}V${y}` : '')
    },
  })

  if (hero && !reduced) {
    gsap.to(intro, { t: 1, duration: 2.4, ease: 'none', delay: 0.2, onUpdate: scene.draw })
    gsap.from(center.querySelectorAll('.char'), {
      opacity: 0,
      y: 26,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.07,
      delay: 0.9,
    })
    gsap.from(center.querySelectorAll('.hero__sub'), { opacity: 0, duration: 1.4, delay: 1.8 })
    gsap.from(cue, { opacity: 0, duration: 1.2, delay: 2.6 })
  }
  return scene
}

/* --------------------------------------------------------------- drawn */

/**
 * A whole work, drawn. mode 'frame': one frame ruled around it, as a
 * draughtsman rules a jiehua pavilion, and the work fills it from the top.
 * mode 'rise': a ground line is drawn across the wall and the work rises
 * from it, a dimension line beside it, as in an elevation.
 */
export function trace(section, [aspect], seed, { mode = 'frame' } = {}) {
  const { stage, svg, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  svg.innerHTML = '<path/><path/><path pathLength="1" stroke-dasharray="1 1"/><path/>'
  const [lead, frame, dim, ticks] = svg.children
  let b, perim

  return pinScene(section, {
    length: 1.3,
    layout() {
      b = fitBig(stage, aspect)
      place(fig, b)
      placeLabel(label, b)
      viewBox(svg, b)
      if (mode === 'frame') {
        frame.removeAttribute('pathLength')
        frame.setAttribute('d', rectPath(b))
        perim = 2 * (b.w + b.h)
        frame.style.strokeDasharray = `${perim} ${perim}`
        dim.setAttribute('d', '')
        ticks.setAttribute('d', '')
      } else {
        frame.setAttribute('pathLength', '1')
        frame.style.strokeDasharray = '1 1'
        frame.setAttribute('d', `M0 ${b.b}H${b.W}`)
        perim = 1
        const dx = b.r + 14
        dim.setAttribute('d', `M${dx} ${b.b}V${b.y}`)
        ticks.setAttribute('d', `M${dx - 4} ${b.b}H${dx + 4}M${dx - 4} ${b.y}H${dx + 4}`)
      }
    },
    render(p) {
      if (mode === 'frame') {
        const y0 = lerp(b.top, b.y, ease.inOut(seg(p, 0.46, 0.64)))
        const y1 = lerp(b.top, b.y, ease.inOut(seg(p, 0, 0.16)))
        lead.setAttribute('d', y1 - y0 > 0.5 ? `M${b.cx} ${y0}V${y1}` : '')
        frame.style.strokeDashoffset = perim * (1 - ease.inOut(seg(p, 0.14, 0.52)))
        const r = ease.inOut(seg(p, 0.4, 0.76))
        fig.style.clipPath = `inset(0 0 ${(1 - r) * 100}% 0)`
      } else {
        lead.setAttribute('d', '')
        frame.style.strokeDashoffset = 1 - ease.inOut(seg(p, 0, 0.26))
        const rise = ease.inOut(seg(p, 0.22, 0.66))
        fig.style.clipPath = `inset(${(1 - rise) * 100}% 0 0 0)`
        dim.style.strokeDashoffset = 1 - rise
        ticks.style.opacity = seg(rise, 0.85, 1)
      }
      fade(label, seg(p, 0.68, 0.84))
    },
  })
}

/** A plan: construction lines run edge to edge first, the two frames are ruled on that grid. */
export function plan(section, aspects) {
  const { stage, svg, figs, labels } = parts(section)
  svg.innerHTML =
    '<g class="construction">' + '<path pathLength="1" stroke-dasharray="1 1"/>'.repeat(8) + '</g><path/><path/>'
  const grid = svg.firstChild
  const lines = [...grid.children]
  const frames = [svg.children[1], svg.children[2]]
  let L
  const perims = []

  return pinScene(section, {
    length: 1.5,
    layout() {
      L = rows(stage, aspects)
      viewBox(svg, L)
      L.boxes.forEach((b, i) => {
        place(figs[i], b)
        placeSide(labels[i], b, L)
        frames[i].setAttribute('d', rectPath(b))
        perims[i] = 2 * (b.w + b.h)
        frames[i].style.strokeDasharray = `${perims[i]} ${perims[i]}`
        const [h1, h2, v1, v2] = lines.slice(i * 4, i * 4 + 4)
        h1.setAttribute('d', `M0 ${b.y}H${L.W}`)
        h2.setAttribute('d', `M${L.W} ${b.b}H0`)
        v1.setAttribute('d', `M${b.x} ${L.top}V${L.H}`)
        v2.setAttribute('d', `M${b.r} ${L.H}V${L.top}`)
      })
    },
    render(p) {
      lines.forEach((l, k) => {
        l.style.strokeDashoffset = 1 - ease.inOut(seg(p, k * 0.025, 0.2 + k * 0.025))
      })
      grid.style.opacity = 1 - seg(p, 0.44, 0.58)
      frames.forEach((f, i) => {
        f.style.strokeDashoffset = perims[i] * (1 - ease.inOut(seg(p, 0.2 + i * 0.07, 0.46 + i * 0.07)))
        const r = ease.inOut(seg(p, 0.58 + i * 0.08, 0.8 + i * 0.08))
        figs[i].style.clipPath = `inset(0 0 ${(1 - r) * 100}% 0)`
        fade(labels[i], seg(p, 0.78 + i * 0.06, 0.9 + i * 0.06))
      })
    },
  })
}

/** An elevation: a ground line is drawn, the work rises from it with a dimension line beside. */
export function elevation(section, aspects) {
  const { stage, svg, figs, labels } = parts(section)
  const dash = '<path pathLength="1" stroke-dasharray="1 1"/>'
  svg.innerHTML = dash.repeat(4) + '<path/><path/>'
  const [g0, g1, d0, d1, t0, t1] = svg.children
  const grounds = [g0, g1]
  const dims = [d0, d1]
  const ticks = [t0, t1]
  let L

  return pinScene(section, {
    length: 1.3,
    layout() {
      L = rows(stage, aspects)
      viewBox(svg, L)
      const x0 = L.left
      const x1 = L.left + L.contentW
      L.boxes.forEach((b, i) => {
        place(figs[i], b)
        placeSide(labels[i], b, L, 30)
        grounds[i].setAttribute('d', i % 2 === 0 ? `M${x0} ${b.b}H${x1}` : `M${x1} ${b.b}H${x0}`)
        const dx = b.side === 'left' ? b.r + 14 : b.x - 14
        dims[i].setAttribute('d', `M${dx} ${b.b}V${b.y}`)
        ticks[i].setAttribute('d', `M${dx - 4} ${b.b}H${dx + 4}M${dx - 4} ${b.y}H${dx + 4}`)
      })
    },
    render(p) {
      L.boxes.forEach((b, i) => {
        grounds[i].style.strokeDashoffset = 1 - ease.inOut(seg(p, i * 0.1, 0.26 + i * 0.1))
        const rise = ease.inOut(seg(p, 0.22 + i * 0.14, 0.6 + i * 0.14))
        figs[i].style.clipPath = `inset(${(1 - rise) * 100}% 0 0 0)`
        dims[i].style.strokeDashoffset = 1 - rise
        ticks[i].style.opacity = seg(rise, 0.85, 1)
        fade(labels[i], seg(p, 0.6 + i * 0.12, 0.76 + i * 0.12))
      })
    },
  })
}

/* --------------------------------------------------------------- whole */

/**
 * A whole work fills the screen: it surfaces out of the wall, then its label.
 * When it opens a chapter, the chapter's heading stands beside it first and
 * gives way to the label.
 */
export function whole(section, [aspect]) {
  const { stage, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  const head = stage.querySelector('.whole__chapter')
  let b

  return pinScene(section, {
    length: head ? 1.5 : 1,
    layout() {
      b = fitFull(stage, aspect)
      place(fig, b)
      placeLabel(label, b)
      if (head) placeLabel(head, b)
    },
    render(p) {
      const o = ease.out(seg(p, 0, head ? 0.3 : 0.45))
      fig.style.opacity = o
      fig.style.transform = `scale(${1.03 - 0.03 * o})`
      if (head) {
        fade(head, Math.min(seg(p, 0.08, 0.26), 1 - seg(p, 0.5, 0.64)))
        fade(label, seg(p, 0.64, 0.82))
      } else {
        fade(label, seg(p, 0.45, 0.68))
      }
    },
  })
}

/* ------------------------------------------------------------- pressed */

/** A work slides in from one side and pushes the vertical line aside to the other. */
export function push(section, [aspect], seed, { side = 'left' } = {}) {
  const { stage, svg, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  svg.innerHTML = '<path pathLength="1" stroke-dasharray="1 1"/>'
  const line = svg.firstChild
  const gap = 10
  const fromLeft = side === 'left'
  let b, k

  return pinScene(section, {
    length: 1.2,
    layout() {
      b = fitBig(stage, aspect)
      place(fig, b)
      placeLabel(label, b, fromLeft ? 'right' : 'left')
      viewBox(svg, b)
      k = Math.max(28, Math.min(120, b.y - b.top - 4))
    },
    render(p) {
      const x = fromLeft
        ? lerp(-b.w - 24, b.x, ease.backInOut(seg(p, 0.1, 0.64)))
        : lerp(b.W + 24, b.x, ease.backInOut(seg(p, 0.1, 0.64)))
      fig.style.transform = `translate3d(${x - b.x}px,0,0)`
      const bx = fromLeft ? Math.max(b.cx, x + b.w + gap) : Math.min(b.cx, x - gap)
      line.setAttribute(
        'd',
        `M${b.cx} ${b.top}V${b.y - k}C${b.cx} ${b.y - k * 0.45} ${bx} ${b.y - k * 0.55} ${bx} ${b.y}V${b.b}` +
          `C${bx} ${b.b + k * 0.55} ${b.cx} ${b.b + k * 0.45} ${b.cx} ${b.b + k}V${b.H}`,
      )
      line.style.strokeDashoffset = 1 - ease.out(seg(p, 0, 0.16))
      fade(label, seg(p, 0.66, 0.82))
    },
  })
}

/** Two works close in from opposite sides and squeeze the line between them into an S. */
export function pinch(section, aspects) {
  const { stage, svg, figs, labels } = parts(section)
  svg.innerHTML = '<path pathLength="1" stroke-dasharray="1 1"/>'
  const line = svg.firstChild
  const gap = 10
  let L

  return pinScene(section, {
    length: 1.5,
    layout() {
      L = rows(stage, aspects)
      viewBox(svg, L)
      L.boxes.forEach((b, i) => {
        place(figs[i], b)
        placeSide(labels[i], b, L, 26)
      })
    },
    render(p) {
      const [A, B] = L.boxes
      const ax = lerp(-A.w - 24, A.x, ease.backInOut(seg(p, 0.08, 0.55)))
      const bx = lerp(L.W + 24, B.x, ease.backInOut(seg(p, 0.2, 0.67)))
      figs[0].style.transform = `translate3d(${ax - A.x}px,0,0)`
      figs[1].style.transform = `translate3d(${bx - B.x}px,0,0)`
      const s1 = Math.max(L.cx, ax + A.w + gap)
      const s2 = Math.min(L.cx, bx - gap)
      const k = Math.max(28, Math.min(110, A.y - L.top - 4))
      const m = B.y - A.b
      line.setAttribute(
        'd',
        `M${L.cx} ${L.top}V${A.y - k}C${L.cx} ${A.y - k * 0.45} ${s1} ${A.y - k * 0.55} ${s1} ${A.y}` +
          `V${A.b}C${s1} ${A.b + m * 0.5} ${s2} ${B.y - m * 0.5} ${s2} ${B.y}V${B.b}`,
      )
      line.style.strokeDashoffset = 1 - ease.out(seg(p, 0, 0.14))
      fade(labels[0], seg(p, 0.6, 0.76))
      fade(labels[1], seg(p, 0.7, 0.86))
    },
  })
}

/** The line turns level; a work drops onto it and presses a hollow into it, like a worn threshold. */
export function sag(section, [aspect]) {
  const { stage, svg, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  svg.innerHTML = '<path pathLength="1" stroke-dasharray="1 1"/>'
  const line = svg.firstChild
  const depth = 26
  let b, y0

  return pinScene(section, {
    length: 1.1,
    layout() {
      b = fitBig(stage, aspect)
      place(fig, b)
      placeLabel(label, b)
      viewBox(svg, b)
      y0 = b.b - depth
    },
    render(p) {
      const y = lerp(-b.h - 40, b.y, ease.backInOut(seg(p, 0.14, 0.66)))
      fig.style.transform = `translate3d(0,${y - b.y}px,0)`
      const sink = Math.max(0, y + b.h - y0)
      const s = Math.min(56, b.x - 4)
      const yb = y0 + sink
      line.setAttribute(
        'd',
        `M0 ${y0}H${b.x - s}C${b.x - s * 0.5} ${y0} ${b.x - s * 0.5} ${yb} ${b.x} ${yb}H${b.r}` +
          `C${b.r + s * 0.5} ${yb} ${b.r + s * 0.5} ${y0} ${b.r + s} ${y0}H${b.W}`,
      )
      line.style.strokeDashoffset = 1 - ease.inOut(seg(p, 0, 0.16))
      fade(label, seg(p, 0.66, 0.82))
    },
  })
}

/* ----------------------------------------------------------- deposited */

/** The line breaks into grains, they scatter, then crystallize around the work. */
export function crystallize(section, [aspect], seed) {
  const { stage, canvas, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  const grains = makeSalt(seed, 280)
  let b

  return withSalt(
    section,
    canvas,
    {
      length: 1.4,
      layout() {
        b = fitBig(stage, aspect)
        place(fig, b)
        placeLabel(label, b)
      },
      render(p, salt) {
        const o = ease.inOut(seg(p, 0.6, 0.84))
        fig.style.opacity = o
        fig.style.transform = `scale(${1.025 - 0.025 * o})`
        fade(label, seg(p, 0.76, 0.9))
        if (!salt) return
        const { ctx } = salt.salt
        ctx.clearRect(0, 0, b.W, b.H)
        const shown = seg(p, 0, 0.12)
        const s = ease.inOut(seg(p, 0.1, 0.36))
        for (const g of grains) {
          if (g.line > shown) continue
          const q = ease.inOut(seg(p, 0.3 + g.delay * 0.14, 0.56 + g.delay * 0.14))
          const [ax, ay] = onLine(g, b)
          const sx = g.sx * b.W
          const sy = lerp(b.top, b.H, g.sy)
          const [px, py, nx, ny] = perimeter(b, g.u)
          const x = lerp(lerp(ax, sx, s), px + nx * g.out, q)
          const y = lerp(lerp(ay, sy, s), py + ny * g.out, q)
          dot(ctx, salt.colors, x, y, lerp(0.85, g.r, q), lerp(0.9, g.a, q))
        }
        ctx.globalAlpha = 1
      },
    },
    () => b,
  )
}

/** Grains fall from the vertical line and settle into one irregular level line: the wall's salt line. */
export function saltline(section, [aspect], seed) {
  const { stage, canvas, figs, labels } = parts(section)
  const [fig] = figs
  const [label] = labels
  const grains = makeSalt(seed, 320)
  const wave = (x) => 5 * Math.sin(x * 0.021 + 1.3) + 3 * Math.sin(x * 0.057 + 0.4) + 1.5 * Math.sin(x * 0.13)
  let b, ys

  return withSalt(
    section,
    canvas,
    {
      length: 1.25,
      layout() {
        b = fitBig(stage, aspect)
        place(fig, b)
        placeLabel(label, b)
        ys = b.wide ? b.b + 14 : b.b + 12
      },
      render(p, salt) {
        const o = ease.inOut(seg(p, 0.5, 0.76))
        fig.style.opacity = o
        fig.style.transform = `translate3d(0,${(1 - o) * -10}px,0)`
        fade(label, seg(p, 0.72, 0.88))
        if (!salt) return
        const { ctx } = salt.salt
        ctx.clearRect(0, 0, b.W, b.H)
        const shown = seg(p, 0, 0.12)
        for (const g of grains) {
          if (g.line > shown) continue
          const q = ease.inOut(seg(p, 0.14 + g.delay * 0.24, 0.48 + g.delay * 0.24))
          const [ax, ay] = onLine(g, b)
          const tx = 20 + g.sx * (b.W - 40)
          const ty = ys + wave(tx) + g.n * 1.8
          const x = lerp(ax, tx, q) + Math.sin(q * Math.PI) * g.jx * 22
          const y = lerp(ay, ty, q)
          dot(ctx, salt.colors, x, y, lerp(0.85, g.r * 0.85, q), lerp(0.9, g.a, q))
        }
        ctx.globalAlpha = 1
      },
    },
    () => b,
  )
}

/**
 * A waterline recedes down the stage. Above it the paper is dry and the works
 * are revealed; salt appears where the water last stood, along their edges.
 */
export function evaporate(section, aspects, seed) {
  const { stage, canvas, figs, labels } = parts(section)
  const grains = makeSalt(seed, 320)
  const front = makeSalt(seed + 1, 130)
  let L

  return withSalt(
    section,
    canvas,
    {
      length: 1.6,
      layout() {
        L = rows(stage, aspects)
        L.boxes.forEach((b, i) => {
          place(figs[i], b)
          placeSide(labels[i], b, L)
        })
        // each grain's resting place: on one of the two frames, or loose on the wall
        for (const g of grains) {
          if (g.i % 10 === 0) {
            g.tx = g.sx * L.W
            g.ty = lerp(L.top, L.H, g.sy)
          } else {
            const [px, py, nx, ny] = perimeter(L.boxes[g.i % 2], g.u)
            g.tx = px + nx * g.out
            g.ty = py + ny * g.out
          }
        }
      },
      render(p, salt) {
        const yf = lerp(L.top - 2, L.H + 12, ease.inOut(seg(p, 0.12, 0.86)))
        L.boxes.forEach((b, i) => {
          figs[i].style.clipPath = `inset(0 0 ${clamp01((b.b - yf) / b.h) * 100}% 0)`
          fade(labels[i], Math.max(seg(yf - b.b, 0, 40), seg(p, 0.86, 0.94)))
        })
        if (!salt) return
        const { ctx } = salt.salt
        const { colors } = salt
        ctx.clearRect(0, 0, L.W, L.H)
        // the water still standing below the line: a darker wet edge fading into a faint wash
        const wet = ctx.createLinearGradient(0, yf, 0, yf + 90)
        wet.addColorStop(0, colors.water)
        wet.addColorStop(1, 'transparent')
        ctx.fillStyle = wet
        ctx.globalAlpha = 0.09
        ctx.fillRect(0, yf, L.W, 90)
        ctx.fillStyle = colors.water
        ctx.globalAlpha = 0.025
        ctx.fillRect(0, yf, L.W, L.H - yf)
        for (const g of grains) {
          const k = seg(yf - g.ty, 0, 46)
          if (k > 0) dot(ctx, colors, g.tx, g.ty, g.r * ease.out(k), g.a * k)
        }
        const half = (ease.out(seg(p, 0, 0.12)) * L.W) / 2
        for (const g of front) {
          const x = lerp(L.cx - half, L.cx + half, g.line)
          const y = yf + Math.sin(x * 0.045 + p * 14) * 1.6 + g.n * 1.1
          if (y < L.H) dot(ctx, colors, x, y, 0.8, 0.85)
        }
        ctx.globalAlpha = 1
      },
    },
    () => L,
  )
}

/**
 * A short gallery slides past sideways. The salt line beneath it starts as
 * scattered grains and condenses into one line, ready to become the river.
 */
export function drift(section, aspects, seed) {
  const { stage, canvas, figs, labels } = parts(section)
  const track = stage.querySelector('.track')
  const grains = makeSalt(seed, 260)
  const gap = 40
  let b, cardH, cardTop, lineY, trackW, x0, x1

  return withSalt(
    section,
    canvas,
    {
      length: 2.2,
      layout() {
        b = stageBox(stage)
        cardH = Math.min(b.H * 0.5, b.H - b.top - 220, 520)
        cardTop = b.top + 16 + (b.H - b.top - cardH - 150) / 2
        lineY = cardTop + cardH + 22
        let x = 0
        aspects.forEach((a, i) => {
          const w = cardH * a
          place(figs[i], { x, y: cardTop, w, h: cardH, r: x + w, b: cardTop + cardH })
          Object.assign(labels[i].style, {
            left: `${x}px`,
            top: `${lineY + 22}px`,
            width: `${Math.max(w, 150)}px`,
            textAlign: 'left',
          })
          labels[i].classList.add('label--side')
          x += w + gap
        })
        trackW = x - gap
        x0 = b.W * 0.62
        x1 = Math.min((b.W - trackW) / 2, b.W - 24 - trackW)
      },
      render(p, salt) {
        const tx = lerp(x0, x1, ease.inOut(seg(p, 0.04, 0.9)))
        track.style.transform = `translate3d(${tx}px,0,0)`
        figs.forEach((f, i) => {
          const c = tx + parseFloat(f.style.left) + parseFloat(f.style.width) / 2
          const o = clamp01(1.25 - Math.abs(c - b.cx) / (b.W * 0.75))
          f.style.opacity = 0.35 + 0.65 * o
          fade(labels[i], seg(o, 0.55, 0.9), 8)
        })
        if (!salt) return
        const { ctx } = salt.salt
        ctx.clearRect(0, 0, b.W, b.H)
        const c = ease.inOut(seg(p, 0.08, 0.94))
        const span = trackW + b.W
        for (const g of grains) {
          if (g.delay > lerp(0.45, 1, c)) continue
          const x = tx - b.W / 2 + g.line * span + g.jx * 3 * (1 - c)
          if (x < -4 || x > b.W + 4) continue
          const y = lineY + g.n * 7 * (1 - c)
          dot(ctx, salt.colors, x, y, lerp(g.r, 0.75, c), lerp(g.a * 0.85, 0.9, c))
        }
        const solid = seg(p, 0.86, 1)
        if (solid > 0) {
          ctx.globalAlpha = solid
          ctx.strokeStyle = salt.colors.grain
          ctx.lineWidth = 1.25
          ctx.beginPath()
          ctx.moveTo(0, lineY)
          ctx.lineTo(b.W, lineY)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      },
    },
    () => b,
  )
}

/* ------------------------------------------------------------- detail */

/**
 * The region settles into focus out of the veil and keeps moving very
 * slowly, as an eye does across a print held close. With salt, grains
 * scattered over the stage gather into one line beneath the region.
 */
export function detail(section, { salt = false } = {}, seed = 1) {
  const stage = section.querySelector('.stage')
  const fig = stage.querySelector('.detail')
  const im = fig.querySelector('img')
  const veil = stage.querySelector('.veil')
  const meta = stage.querySelector('.detail__meta')
  const text = stage.querySelector('.detail__text')
  const canvas = stage.querySelector('.salt')
  const grains = salt ? makeSalt(seed, 300) : null
  let b, lineY

  const config = {
    length: 1.6,
    layout() {
      b = stageBox(stage)
      fig.style.top = `${b.top}px`
      const band = meta.offsetHeight + 44
      fig.style.bottom = `${band}px`
      lineY = b.H - band + 10
    },
    render(p, holder) {
      const o = ease.out(seg(p, 0, 0.28))
      fig.style.opacity = o
      const drift = ease.inOut(seg(p, 0.08, 0.96))
      im.style.transform = `scale(${1.14 - 0.08 * o}) translate3d(${(0.5 - drift) * 3}%,${(drift - 0.5) * 2}%,0)`
      veil.style.opacity = 1 - 0.75 * ease.inOut(seg(p, 0.1, 0.62))
      fade(text, seg(p, 0.5, 0.68))
      if (!holder) return
      const { ctx } = holder.salt
      ctx.clearRect(0, 0, b.W, b.H)
      const c = ease.inOut(seg(p, 0.24, 0.84))
      for (const g of grains) {
        const x = lerp(g.sx * b.W, 20 + g.line * (b.W - 40), c) + Math.sin(c * Math.PI) * g.jx * 10
        const y = lerp(lerp(b.top, b.H, g.sy), lineY + g.n * 1.6, c)
        dot(ctx, holder.colors, x, y, lerp(g.r, 0.8, c), g.a * (0.6 + 0.4 * c))
      }
      ctx.globalAlpha = 1
    },
  }
  if (!grains) return pinScene(section, { ...config, render: (p) => config.render(p, null) })
  return withSalt(section, canvas, config, () => b)
}

/* ---------------------------------------------------------- synthesis */

export function synthesis(section) {
  const { stage, canvas, svg, figs } = parts(section)
  const [fig] = figs
  svg.innerHTML = '<path/>'
  const axis = svg.firstChild
  const grains = makeSalt(1938, 220)
  let b

  return withSalt(
    section,
    canvas,
    {
      length: 1.5,
      layout() {
        b = fit(stage, 36 / 96, { maxW: 9999, maxHRatio: 0.8, below: 24 })
        place(fig, b)
        viewBox(svg, b)
        axis.setAttribute('d', `M${b.cx} ${b.top}V${b.H + 2}`)
      },
      render(p, salt) {
        const solid = seg(p, 0.3, 0.42)
        axis.style.opacity = solid
        const rise = ease.out(seg(p, 0.36, 0.78))
        fig.style.transform = `translate3d(0,${(1 - rise) * (b.H - b.y + 24)}px,0)`
        if (!salt) return
        const { ctx } = salt.salt
        ctx.clearRect(0, 0, b.W, b.H)
        if (solid >= 1) return
        const g0 = ease.inOut(seg(p, 0, 0.34))
        for (const g of grains) {
          const x = lerp(g.sx * b.W, b.cx + g.jx * 0.4, g0)
          const y = lerp(lerp(b.top, b.H, g.sy), lerp(b.top, b.H, g.line), g0)
          dot(ctx, salt.colors, x, y, lerp(g.r, 0.8, g0), g.a * (1 - solid))
        }
        ctx.globalAlpha = 1
      },
    },
    () => b,
  )
}

export function exit(section) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.detail')
  const im = fig.querySelector('img')
  const text = stage.querySelector('.exit__line')
  const back = stage.querySelector('.exit__back')
  svg.innerHTML = '<path class="water" pathLength="1" stroke-dasharray="1 1"/>'
  const water = svg.firstChild
  let b

  return pinScene(section, {
    length: 1.2,
    layout() {
      b = stageBox(stage)
      viewBox(svg, b)
      const band = text.offsetHeight + 44 + 28 + 56
      fig.style.top = `${b.top}px`
      fig.style.bottom = `${band}px`
      // the river runs along the plate's lower edge, across the whole wall
      const wy = b.H - band - 28
      const pts = []
      for (let x = -4; x <= b.W + 4; x += 3) {
        pts.push(`${x.toFixed(1)} ${(wy + Math.sin((x / 30) * TAU * 0.5) * 3).toFixed(1)}`)
      }
      water.setAttribute('d', `M${pts.join('L')}`)
      text.style.top = `${b.H - band + 28}px`
      back.style.top = `${b.H - band + 28 + text.offsetHeight + 24}px`
    },
    render(p) {
      const o = ease.out(seg(p, 0, 0.3))
      fig.style.opacity = o
      im.style.transform = `scale(${1.06 - 0.06 * o})`
      water.style.strokeDashoffset = 1 - ease.inOut(seg(p, 0.28, 0.62))
      fade(text, seg(p, 0.52, 0.7))
      back.style.opacity = seg(p, 0.64, 0.8)
      back.style.pointerEvents = p > 0.72 ? '' : 'none'
    },
  })
}

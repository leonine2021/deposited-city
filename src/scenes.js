// Scroll-driven scenes. Each scene pins its section for a stretch of scroll and
// maps scroll progress p (0 to 1) onto a pure render(p), so scrolling back
// plays everything in reverse, as on Apple product pages.
//
// The line is the protagonist and changes its relation to the work per zone:
// prologue - it descends and stops at the sealed plate's upper edge
// drawn     - it traces the work's frame like a ruler, then the work appears
// pressed   - the work slides in and pushes the line aside, bending it
// deposited - it breaks into salt grains that crystallize around the work
// synthesis - the grains regather into one line, the river's axis
// exit      - the sealed plate returns with a waterline beneath it

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

/** Fit a work of the given aspect (w/h) into the stage, leaving room below for its label. */
function fit(stage, aspect, { maxW = 680, maxHRatio = 0.7, below = 112 } = {}) {
  const W = stage.clientWidth
  const H = stage.clientHeight
  const top = barHeight()
  const room = H - top - below - 32
  const maxH = Math.min(H * maxHRatio, room)
  let w = Math.min(W - 48, maxW)
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return { W, H, top, cx: W / 2, x: (W - w) / 2, y: top + 16 + (room - h) / 2, w, h }
}

function place(fig, b) {
  Object.assign(fig.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` })
}

function placeBelow(el, b, gap = 22) {
  Object.assign(el.style, { left: 'var(--gutter)', right: 'var(--gutter)', top: `${b.y + b.h + gap}px` })
}

function fade(el, o, dy = 14) {
  el.style.opacity = o
  el.style.transform = `translate3d(0,${(1 - o) * dy}px,0)`
  el.style.pointerEvents = o > 0.5 ? '' : 'none'
}

function viewBox(svg, b) {
  svg.setAttribute('viewBox', `0 0 ${b.W} ${b.H}`)
}

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
 * viewport, so a dozen salt scenes never sit in memory at once.
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
  if (d < b.h) return [b.x + b.w, b.y + d, 1, 0]
  d -= b.h
  if (d < b.w) return [b.x + b.w - d, b.y + b.h, 0, 1]
  d -= b.w
  return [b.x, b.y + b.h - d, -1, 0]
}

function makeSalt(seed, n) {
  const r = rng(seed)
  const clusters = Array.from({ length: 9 }, () => r())
  return Array.from({ length: n }, (_, i) => {
    const clustered = r() < 0.62
    const big = r() < 0.05
    return {
      line: i / n,
      jx: (r() - 0.5) * 2.2,
      sx: 0.06 + r() * 0.88,
      sy: 0.04 + r() * 0.92,
      u: clustered ? clusters[Math.floor(r() * clusters.length)] + gauss(r) * 0.014 : r(),
      out: 1.5 + Math.abs(gauss(r)) * (clustered ? 6 : 3.5),
      r: big ? 2.6 + r() * 1.4 : clustered ? 0.8 + r() * 1.8 : 0.5 + r() * 0.9,
      a: 0.5 + r() * 0.45,
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
  }
}

/* ------------------------------------------------------------------------ */

export function hero(section) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const center = stage.querySelector('.hero__center')
  const cue = stage.querySelector('.hero__cue')
  svg.innerHTML = '<path/>'
  const line = svg.firstChild
  const intro = { t: reduced ? 1 : 0 }
  let b, endY

  const scene = pinScene(section, {
    length: 0.9,
    layout() {
      b = { W: stage.clientWidth, H: stage.clientHeight, top: barHeight() }
      b.cx = b.W / 2
      viewBox(svg, b)
      const ch = center.offsetHeight
      const y = Math.max(b.top + 80, b.H * 0.52 - ch * 0.4)
      center.style.top = `${y}px`
      endY = y - 32
    },
    render(p) {
      const out = ease.inOut(seg(p, 0, 0.5))
      center.style.opacity = 1 - out
      center.style.transform = `translate3d(0,${-out * 56}px,0)`
      cue.style.opacity = 1 - seg(p, 0, 0.12)
      const y1 = lerp(b.top, endY, ease.inOut(intro.t))
      const y2 = lerp(y1, b.H + 2, ease.inOut(seg(p, 0.3, 1)))
      line.setAttribute('d', y2 - b.top > 0.5 ? `M${b.cx} ${b.top}V${y2}` : '')
    },
  })

  if (!reduced) {
    gsap.to(intro, { t: 1, duration: 1.8, ease: 'none', delay: 0.25, onUpdate: scene.draw })
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

export function prologue(section, aspect) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.work')
  const label = stage.querySelector('.label')
  svg.innerHTML = '<path/>'
  const line = svg.firstChild
  let b

  return pinScene(section, {
    length: 1.1,
    layout() {
      b = fit(stage, aspect, { maxW: 340, maxHRatio: 0.5, below: 190 })
      place(fig, b)
      placeBelow(label, b, 30)
      viewBox(svg, b)
    },
    render(p) {
      const o = ease.out(seg(p, 0, 0.3))
      fig.style.opacity = o
      fig.style.transform = `scale(${0.94 + 0.06 * o})`
      const y = lerp(b.top, b.y, ease.inOut(seg(p, 0.22, 0.56)))
      line.setAttribute('d', y - b.top > 0.5 ? `M${b.cx} ${b.top}V${y}` : '')
      fade(label, seg(p, 0.56, 0.76))
    },
  })
}

export function drawn(section, aspect) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.work')
  const label = stage.querySelector('.label')
  svg.innerHTML = '<path/><path/>'
  const [lead, frame] = svg.children
  let b, perim

  return pinScene(section, {
    length: 1.25,
    layout() {
      b = fit(stage, aspect)
      place(fig, b)
      placeBelow(label, b)
      viewBox(svg, b)
      frame.setAttribute('d', `M${b.cx} ${b.y}H${b.x + b.w}V${b.y + b.h}H${b.x}V${b.y}Z`)
      perim = 2 * (b.w + b.h)
      frame.style.strokeDasharray = `${perim} ${perim}`
    },
    render(p) {
      const y0 = lerp(b.top, b.y, ease.inOut(seg(p, 0.46, 0.64)))
      const y1 = lerp(b.top, b.y, ease.inOut(seg(p, 0, 0.16)))
      lead.setAttribute('d', y1 - y0 > 0.5 ? `M${b.cx} ${y0}V${y1}` : '')
      frame.style.strokeDashoffset = perim * (1 - ease.inOut(seg(p, 0.14, 0.52)))
      const r = ease.inOut(seg(p, 0.4, 0.76))
      fig.style.clipPath = `inset(0 0 ${(1 - r) * 100}% 0)`
      fade(label, seg(p, 0.68, 0.84))
    },
  })
}

export function pressed(section, aspect, from) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.work')
  const label = stage.querySelector('.label')
  svg.innerHTML = '<path pathLength="1" stroke-dasharray="1 1"/>'
  const line = svg.firstChild
  const dir = from === 'left' ? 1 : -1
  const gap = 10
  let b, k

  return pinScene(section, {
    length: 1.25,
    layout() {
      b = fit(stage, aspect)
      place(fig, b)
      placeBelow(label, b)
      viewBox(svg, b)
      k = Math.max(28, Math.min(120, b.y - b.top - 4))
    },
    render(p) {
      const start = dir > 0 ? -b.w - 24 : b.W + 24
      const x = lerp(start, b.x, ease.backInOut(seg(p, 0.1, 0.64)))
      fig.style.transform = `translate3d(${x - b.x}px,0,0)`
      const edge = dir > 0 ? x + b.w + gap : x - gap
      const bx = dir > 0 ? Math.max(b.cx, edge) : Math.min(b.cx, edge)
      line.setAttribute(
        'd',
        `M${b.cx} ${b.top}V${b.y - k}C${b.cx} ${b.y - k * 0.45} ${bx} ${b.y - k * 0.55} ${bx} ${b.y}V${b.y + b.h}`,
      )
      line.style.strokeDashoffset = 1 - ease.out(seg(p, 0, 0.16))
      fade(label, seg(p, 0.66, 0.82))
    },
  })
}

export function deposited(section, aspect, seed) {
  const stage = section.querySelector('.stage')
  const canvas = stage.querySelector('.salt')
  const fig = stage.querySelector('.work')
  const label = stage.querySelector('.label')
  const grains = makeSalt(seed, 280)
  let b, salt, color

  const scene = pinScene(section, {
    length: 1.4,
    layout() {
      b = fit(stage, aspect, { below: fig.dataset.id === '11' ? 168 : 112 })
      place(fig, b)
      placeBelow(label, b)
      salt?.size()
      color = saltColors()
    },
    render(p) {
      const o = ease.inOut(seg(p, 0.6, 0.84))
      fig.style.opacity = o
      fig.style.transform = `scale(${1.025 - 0.025 * o})`
      fade(label, seg(p, 0.76, 0.9))
      if (!salt?.active) return
      const { ctx } = salt
      ctx.clearRect(0, 0, b.W, b.H)
      const shown = seg(p, 0, 0.12)
      const s = ease.inOut(seg(p, 0.1, 0.36))
      for (const g of grains) {
        if (g.line > shown) continue
        const q = ease.inOut(seg(p, 0.3 + g.delay * 0.14, 0.56 + g.delay * 0.14))
        const ax = b.cx + g.jx
        const ay = lerp(b.top, b.H, g.line)
        const sx = g.sx * b.W
        const sy = lerp(b.top, b.H, g.sy)
        const [px, py, nx, ny] = perimeter(b, g.u)
        const x = lerp(lerp(ax, sx, s), px + nx * g.out, q)
        const y = lerp(lerp(ay, sy, s), py + ny * g.out, q)
        dot(ctx, color, x, y, lerp(0.85, g.r, q), lerp(0.9, g.a, q))
      }
      ctx.globalAlpha = 1
    },
  })
  salt = saltCanvas(canvas, scene, () => b)
  salt.size()
  scene.draw()
  return scene
}

export function synthesis(section) {
  const stage = section.querySelector('.stage')
  const canvas = stage.querySelector('.salt')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.work')
  svg.innerHTML = '<path/>'
  const axis = svg.firstChild
  const grains = makeSalt(1938, 220)
  let b, salt, color

  const scene = pinScene(section, {
    length: 1.5,
    layout() {
      b = fit(stage, 36 / 96, { maxW: 9999, maxHRatio: 0.8, below: 24 })
      place(fig, b)
      viewBox(svg, b)
      axis.setAttribute('d', `M${b.cx} ${b.top}V${b.H + 2}`)
      salt?.size()
      color = saltColors()
    },
    render(p) {
      const solid = seg(p, 0.3, 0.42)
      axis.style.opacity = solid
      const rise = ease.out(seg(p, 0.36, 0.78))
      fig.style.transform = `translate3d(0,${(1 - rise) * (b.H - b.y + 24)}px,0)`
      if (!salt?.active) return
      const { ctx } = salt
      ctx.clearRect(0, 0, b.W, b.H)
      if (solid >= 1) return
      const g0 = ease.inOut(seg(p, 0, 0.34))
      for (const g of grains) {
        const x = lerp(g.sx * b.W, b.cx + g.jx * 0.4, g0)
        const y = lerp(lerp(b.top, b.H, g.sy), lerp(b.top, b.H, g.line), g0)
        dot(ctx, color, x, y, lerp(g.r, 0.8, g0), g.a * (1 - solid))
      }
      ctx.globalAlpha = 1
    },
  })
  salt = saltCanvas(canvas, scene, () => b)
  salt.size()
  scene.draw()
  return scene
}

export function exit(section, aspect) {
  const stage = section.querySelector('.stage')
  const svg = stage.querySelector('.ink')
  const fig = stage.querySelector('.work')
  const text = stage.querySelector('.exit__line')
  const back = stage.querySelector('.exit__back')
  svg.innerHTML = '<path class="water" pathLength="1" stroke-dasharray="1 1"/>'
  const water = svg.firstChild
  let b

  return pinScene(section, {
    length: 1.1,
    layout() {
      b = fit(stage, aspect, { maxW: 230, maxHRatio: 0.34, below: 250 })
      place(fig, b)
      viewBox(svg, b)
      const wy = b.y + b.h + 30
      const pts = []
      for (let x = b.x - 40; x <= b.x + b.w + 40; x += 3) {
        pts.push(`${x.toFixed(1)} ${(wy + Math.sin((x / 30) * TAU * 0.5) * 3).toFixed(1)}`)
      }
      water.setAttribute('d', `M${pts.join('L')}`)
      text.style.top = `${wy + 34}px`
      back.style.top = `${wy + 34 + text.offsetHeight + 28}px`
    },
    render(p) {
      const o = ease.out(seg(p, 0, 0.25))
      fig.style.opacity = o
      fig.style.transform = `translate3d(0,${(1 - o) * 24}px,0)`
      water.style.strokeDashoffset = 1 - ease.inOut(seg(p, 0.22, 0.58))
      fade(text, seg(p, 0.5, 0.68))
      back.style.opacity = seg(p, 0.62, 0.78)
      back.style.pointerEvents = p > 0.7 ? '' : 'none'
    },
  })
}

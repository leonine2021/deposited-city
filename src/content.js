// All visitor-facing text. Written for the screen, apart from the gallery's
// wall texts: a short story told in few words and in quotation. Quotations
// are cited where they appear; work titles and media follow the labels.
// The site shows seven works chosen by the artist, plus the sealed plate (00).

export const site = {
  title: { zh: '界：析出的城市', en: 'Boundary: The Deposited City' },
  titleLines: { zh: ['界：', '析出的城市'], en: ['Boundary:', 'The Deposited City'] },
  short: { zh: '界', en: 'Boundary' },
  subtitle: {
    zh: '一位建筑师关于线的展览 · 建筑师郭雯璐',
    en: "An architect's exhibition on where lines come from · Architect Wenlu Guo",
  },
  thesis: {
    zh: '每一条线，都是有东西来过的证据。',
    en: 'Every line is evidence that something was here.',
  },
  preface: {
    zh: '潮水退去，沙上一道白线。\n杯子挪开，桌上一圈水渍。\n人走多了，草地上一条路。\n\n城市里的线，也是这样来的。\n只是我们，把它们都当成了图纸。',
    en: 'The tide goes out: a white line on the sand.\nA glass is lifted: a ring on the table.\nEnough feet cross a lawn: a path.\n\nThe lines of a city come the same way.\nWe just take them all for drawings.',
  },
  scroll: { zh: '向下滑动', en: 'Scroll' },
  prologue: {
    zh: '一条线，是什么留下的？',
    en: 'What left this line?',
  },
  exit: {
    line: {
      zh: '城市之下，水一直都在。',
      en: 'Beneath the city, the water never left.',
    },
    back: { zh: '回到开头', en: 'Back to the beginning' },
  },
  detail: { zh: '局部', en: 'Detail' },
  pendingWork: { zh: '作品图待补', en: 'Image forthcoming' },
  index: { zh: '作品索引', en: 'Index of works' },
  credit: { zh: '© 2026 郭雯璐 · 保留所有权利', en: '© 2026 Wenlu Guo · All rights reserved' },
}

// Each zone opens on a quotation (theme, with its author) laid over a region of
// a print; the zone's text that follows is one or two short sentences, with an
// optional second quotation (epigraph) above it.
export const zones = {
  prologue: { name: { zh: '序', en: 'Prologue' } },
  drawn: {
    numeral: { zh: '一', en: '1' },
    name: { zh: '画出的线', en: 'Drawn' },
    theme: { zh: '平面是生成元。', en: 'The plan is the generator.' },
    themeBy: { zh: '勒·柯布西耶', en: 'Le Corbusier' },
    body: {
      zh: '一笔一画，都是意志。\n可线一旦离开立面，就软了，弯了，长进了城市。',
      en: 'Every stroke is an act of will.\nBut once a line leaves the facade, it softens, bends, and grows into the city.',
    },
  },
  pressed: {
    numeral: { zh: '二', en: '2' },
    name: { zh: '压出的线', en: 'Pressed' },
    theme: {
      zh: '其实地上本没有路，走的人多了，也便成了路。',
      en: 'At first there was no road. When many walk one way, a road is made.',
    },
    themeBy: { zh: '鲁迅《故乡》', en: 'Lu Xun, My Old Home' },
    epigraph: {
      zh: '行走者交错的路径，赋予空间以形状。',
      en: 'Their intertwined paths give their shape to spaces.',
    },
    epigraphBy: { zh: '米歇尔·德·塞托《日常生活实践》', en: 'Michel de Certeau, The Practice of Everyday Life' },
    body: {
      zh: '粗麻按进纸，棉线压出沟，脚步踩出路。\n这些线不是画的，是按出来的。',
      en: 'Burlap pressed into paper, thread into a groove, feet into a path.\nThese lines were not drawn. They were pressed.',
    },
  },
  deposited: {
    numeral: { zh: '三', en: '3' },
    name: { zh: '析出的线', en: 'Deposited' },
    theme: {
      zh: '凿户牖以为室，当其无，有室之用。',
      en: 'Doors and windows are cut to make a room; it is the empty space that makes it of use.',
    },
    themeBy: { zh: '《老子》第十一章', en: 'Laozi, Tao Te Ching, 11' },
    body: {
      zh: '水走了，盐留在水最后停留的地方。\n没有一条线出自人手。形状，是缺席给的。',
      en: 'The water left; the salt stayed where it last stood.\nNot one of these lines came from a hand. Their shape was given by absence.',
    },
  },
  coda: { name: { zh: '尾声', en: 'Coda' } },
}

const T = {
  mono: { zh: '单版画，纸本', en: 'Monoprint on paper' },
  photo: { zh: '单版画、照片转印，纸本', en: 'Monoprint with photo transfer on paper' },
  collage: { zh: '单版画、拼贴，纸本', en: 'Monoprint and collage on paper' },
  collagraph: { zh: '拼贴版画，纸本', en: 'Collagraph on paper' },
  salt: { zh: '单版画、盐析，纸本', en: 'Monoprint with salt precipitation on paper' },
}

export const works = [
  { id: '00', zone: 'prologue', title: { zh: '盖板', en: 'Cover' }, medium: T.mono },

  {
    id: '01',
    zone: 'drawn',
    title: { zh: '抽丝', en: 'Drawing the Thread' },
    medium: T.photo,
    note: {
      zh: '从坚硬的立面里抽出一根线。它变软，弯下来，流进城市。',
      en: 'A thread drawn out of a hard facade softens, bends, and runs into the city.',
    },
  },
  {
    id: '02',
    zone: 'drawn',
    title: { zh: '绿涌入立面', en: 'Green Enters the Facade' },
    medium: T.photo,
    note: { zh: '绿涌进来，立面让开了。', en: 'The green comes in; the facade gives way.' },
  },
  { id: '03', zone: 'drawn', title: { zh: '窗格', en: 'Grid' }, medium: T.collage },
  {
    id: '05',
    zone: 'drawn',
    title: { zh: '悬梦', en: 'Suspended Dream' },
    medium: { zh: '单版画、照片转印、压印线，纸本', en: 'Monoprint, photo transfer and embossed thread on paper' },
    note: {
      zh: '看展的人悬在一张网上，路灯和鸽子叠进同一个梦。',
      en: 'Viewers hang in a net; a streetlight and pigeons fold into the same dream.',
    },
  },

  {
    id: '06',
    zone: 'pressed',
    title: { zh: '脉', en: 'Vessels' },
    medium: { zh: '单版画、薄纸拼贴、压印线，纸本', en: 'Monoprint, chine-collé and embossed thread on paper' },
  },

  { id: '10', zone: 'deposited', title: { zh: '析出 I', en: 'Deposit I' }, medium: T.salt },
  { id: '13', zone: 'deposited', title: { zh: '洇', en: 'Seep' }, medium: T.mono },
]

// One line under each region, after its cover's text gives way.
export const details = {
  '00': {
    zh: '黑的下面，还有东西。',
    en: 'Something lies under the black.',
  },
  '03': {
    zh: '坚硬的笔，干裂的地。每一道分割，都是一次摩擦。',
    en: 'A hard stroke on cracked ground. Every division is a friction.',
  },
  '06': {
    zh: '一根线按进纸里，留下一道沟。不是画的，是走过的。',
    en: 'A thread pressed into paper leaves a groove: not drawn, but passed through.',
  },
  '10': {
    zh: '白点，是水的脚印。',
    en: "The white spots are the water's footprints.",
  },
  '13': {
    zh: '水慢慢洇开，没有一条边界守得住。',
    en: 'Water seeps outward, slowly. No border holds.',
  },
}

// The quotation over a cover that does not open a zone.
export const coverLines = {
  '03': {
    zh: '城市，在干燥的土地上划下界线。',
    en: 'The city scores its borders into dry ground.',
  },
  '13': {
    zh: '人不能两次踏进同一条河流。',
    en: 'You cannot step twice into the same river.',
    by: { zh: '赫拉克利特', en: 'Heraclitus' },
  },
}

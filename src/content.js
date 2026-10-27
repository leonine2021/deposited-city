// All visitor-facing text. Written for the screen, apart from the gallery's
// wall texts: a short story told in few words and in quotation. Quotations
// are cited where they appear; work titles and media follow the labels.
// The site shows seven works chosen by the artist, plus the sealed plate (00).

export const site = {
  title: { zh: '界：析出的城市', en: 'Boundary: The Deposited City' },
  titleLines: { zh: ['界：', '析出的城市'], en: ['Boundary:', 'The Deposited City'] },
  short: { zh: '界', en: 'Boundary' },
  subtitle: {
    zh: '一位建筑设计师，用线想象城市 · 郭雯璐',
    en: 'An architect imagines the city in lines · Wenlu Guo',
  },
  thesis: {
    zh: '每一条线，都是一次经过。',
    en: 'Every line is a passing.',
  },
  preface: {
    zh: '潮水退去，沙上一道盐白。\n雨水流过，墙上一道锈痕。\n人走多了，荒地上踏出一条路。\n\n城市的每一条线，\n都是先被经过，才被画下。',
    en: 'The tide withdraws: a line of salt on the sand.\nRain runs down: a seam of rust on the wall.\nFeet keep crossing: a path through the field.\n\nEvery line in a city\nwas passed through before it was drawn.',
  },
  scroll: { zh: '向下滑动', en: 'Scroll' },
  prologue: {
    zh: '一条线，是什么留下的？',
    en: 'What left this line?',
  },
  exit: {
    back: { zh: '回到开头', en: 'Back to the beginning' },
  },
  detail: { zh: '局部', en: 'Detail' },
  pendingWork: { zh: '作品图待补', en: 'Image forthcoming' },
  index: { zh: '作品索引', en: 'Index of works' },
  credit: { zh: '© 2026 郭雯璐 · 保留所有权利', en: '© 2026 Wenlu Guo · All rights reserved' },
}

// Each zone opens on a quotation (theme, with its author) laid over a region of
// a print; the zone's text that follows, if any, is one or two short sentences,
// with an optional second quotation (epigraph) above it.
export const zones = {
  prologue: { name: { zh: '序', en: 'Prologue' } },
  drawn: {
    numeral: { zh: '一', en: '1' },
    name: { zh: '画出的线', en: 'Drawn' },
    theme: { zh: '平面是生成元。', en: 'The plan is the generator.' },
    themeBy: { zh: '勒·柯布西耶', en: 'Le Corbusier' },
    // no wall text: the chapter goes straight from its cover to the works
  },
  pressed: {
    numeral: { zh: '二', en: '2' },
    name: { zh: '压出的线', en: 'Pressed' },
    theme: {
      zh: '建筑由它所见证的行动来定义，\n一如由它围合的墙。',
      en: 'Architecture is defined by the actions it witnesses as much as by the enclosure of its walls.',
    },
    themeBy: { zh: '伯纳德·屈米《建筑与断裂》', en: 'Bernard Tschumi, Architecture and Disjunction' },
    epigraph: {
      zh: '行走者交错的路径，赋予空间以形状。',
      en: 'Their intertwined paths give their shape to spaces.',
    },
    epigraphBy: { zh: '米歇尔·德·塞托《日常生活实践》', en: 'Michel de Certeau, The Practice of Everyday Life' },
    body: {
      zh: '有些线，不是画出来的。\n是重量，是摩擦，是一次又一次的经过。',
      en: 'Some lines are not drawn.\nThey are weight, and friction, and passing after passing.',
    },
  },
  deposited: {
    numeral: { zh: '三', en: '3' },
    name: { zh: '析出的线', en: 'Deposited' },
    theme: {
      zh: '房子不该建在山上，\n它应当属于这座山。',
      en: 'No house should ever be on a hill or on anything.\nIt should be of the hill.',
    },
    themeBy: {
      zh: '弗兰克·劳埃德·赖特《一部自传》',
      en: 'Frank Lloyd Wright, An Autobiography',
    },
    body: {
      zh: '水走了，盐留在它最后停留的地方。\n软的水，刻进硬的地。没有一条线出自人手。',
      en: 'The water left; the salt stayed where it last stood.\nSoft water cut into hard ground. Not one of these lines came from a hand.',
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
  { id: '00', zone: 'prologue', title: { zh: '覆', en: 'Overlay' }, medium: T.mono },

  {
    id: '01',
    zone: 'drawn',
    title: { zh: '抽丝', en: 'Drawing the Thread' },
    medium: T.photo,
  },
  {
    id: '02',
    zone: 'drawn',
    title: { zh: '隙', en: 'Interval' },
    medium: T.photo,
    note: {
      zh: '两道坚硬的立面之间，绿，慢慢长了进来。',
      en: 'Between two hard facades, green grows in, slowly.',
    },
  },
  { id: '03', zone: 'pressed', title: { zh: '划界', en: 'Drawing Borders' }, medium: T.collage },
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

  { id: '08', zone: 'coda', title: { zh: '络', en: 'Mesh' }, medium: T.collagraph },
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
    zh: '盐粒、油和水彼此推开，留下这些白点。',
    en: 'Salt, oil and water push each other apart, and leave these white spots.',
  },
  '08': {
    zh: '网压进了身体。线，一直在我们里面。',
    en: 'The mesh is pressed into the body. The lines were in us all along.',
  },
  '13': {
    zh: '水慢慢洇开，没有一条边界守得住。',
    en: 'Water seeps outward, slowly. No border holds.',
  },
}

// The line over a cover that does not open a zone.
export const coverLines = {
  // the ending answers the opening question, "What left this line?"
  '08': {
    zh: '是我们。',
    en: 'We did.',
  },
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

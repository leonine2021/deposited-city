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
  // after the last work: the show is coming to a physical space
  soon: {
    kicker: { zh: '线下展览', en: 'In person' },
    title: { zh: '析出的城市，\n即将在真实的空间中展开。', en: 'The Deposited City\nwill soon unfold in a real space.' },
    body: {
      zh: '具体时间与地点，将在此公布。\n敬请期待。',
      en: 'Dates and venue will be announced here.\nComing soon.',
    },
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
      zh: '水不会画图。\n它只是慢慢退去，把走过的路，一粒一粒，留成了盐。',
      en: 'Water does not draw.\nIt only withdraws, slowly, and leaves the way it went in salt, grain by grain.',
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
    zh: '土地原本没有边界。\n城市落下一笔，干裂便顺着笔画蔓延开来。',
    en: 'The land had no borders.\nThe city set down a stroke, and the cracks spread along it.',
  },
  '10': {
    zh: '盐粒、油和水彼此推开，留下这些白点。',
    en: 'Salt, oil and water push each other apart, and leave these white spots.',
  },
  '08': {
    zh: '络，是网，也是身体里的经络。\n街道、管线、边界，一层层压进纸里，最后长成了血管和指纹的样子。\n我们以为线在城市里，其实它早已在我们身上。',
    en: 'Luo is a net, and the meridians of the body.\nStreets, pipes and borders, pressed into paper layer on layer, end up looking like veins and fingerprints.\nWe thought the lines were out in the city. They were in us all along.',
  },
  '13': {
    zh: '雨一遍遍洗过大地，铁锈从土里渗出来。\n蓝与褐慢慢洇在一起，是时间留在地表的颜色。',
    en: 'Rain washes the ground again and again; rust seeps up out of the earth.\nBlue and brown bleed slowly into each other: the colour time leaves on the land.',
  },
}

// The line over a cover that does not open a zone.
export const coverLines = {
  // the ending: the opening question returns, then its answer
  '08': {
    echo: true,
    zh: '是我们。',
    en: 'We did.',
    note: {
      zh: '我们走过城市，\n城市也走过我们。',
      en: 'We pass through the city.\nThe city passes through us.',
    },
  },
  '03': {
    zh: '城市，在干燥的土地上划下界线。',
    en: 'The city scores its borders into dry ground.',
  },
  '13': {
    zh: '建筑真正的光、色彩与珍贵，\n要到时间金色的污痕里去找。',
    en: 'It is in that golden stain of time that we are to look for\nthe real light, and colour, and preciousness of architecture.',
    by: { zh: '约翰·罗斯金《建筑的七盏明灯》', en: 'John Ruskin, The Seven Lamps of Architecture' },
  },
}

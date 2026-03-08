import { ArticleCard, ArticleFull } from '@/types/article'

export const mockArticles: ArticleCard[] = [
  {
    id: '1',
    wikipediaId: 1,
    title: 'The History of Artificial Intelligence',
    extract: 'Explore the fascinating journey of AI from its philosophical roots to modern machine learning.',
    category: 'Technology',
    readingTimeMinutes: 5,
    isFeatured: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    language: 'en',
    funFact: 'The term "Artificial Intelligence" was coined in 1956 at the Dartmouth Summer Research Project.',
    isLiked: false,
    isBookmarked: false,
    likeCount: 342,
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
  },
  {
    id: '2',
    wikipediaId: 2,
    title: 'Ancient Rome: Rise and Fall of an Empire',
    extract: "Discover how Rome transformed from a small city-state to one of history's greatest empires.",
    category: 'History',
    readingTimeMinutes: 8,
    isFeatured: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    language: 'en',
    funFact: 'Ancient Romans invented concrete, which is still used in modern construction.',
    isLiked: false,
    isBookmarked: false,
    likeCount: 521,
    url: 'https://en.wikipedia.org/wiki/Ancient_Rome',
  },
  {
    id: '3',
    wikipediaId: 3,
    title: 'The Human Brain: Unlocking Its Mysteries',
    extract: 'Understanding the most complex organ in the human body and how it controls our thoughts and actions.',
    category: 'Science',
    readingTimeMinutes: 6,
    isFeatured: false,
    imageUrl: null,
    language: 'en',
    funFact: 'The human brain contains approximately 86 billion neurons.',
    isLiked: false,
    isBookmarked: false,
    likeCount: 789,
    url: 'https://en.wikipedia.org/wiki/Human_brain',
  },
  {
    id: '4',
    wikipediaId: 4,
    title: 'Climate Change: Past, Present, and Future',
    extract: 'A comprehensive look at global climate patterns, human impact, and the path toward sustainable solutions.',
    category: 'Geography',
    readingTimeMinutes: 7,
    isFeatured: false,
    imageUrl: null,
    language: 'en',
    funFact: "The Antarctic ice sheet holds about 90% of the world's ice.",
    isLiked: false,
    isBookmarked: false,
    likeCount: 654,
    url: 'https://en.wikipedia.org/wiki/Climate_change',
  },
  {
    id: '5',
    wikipediaId: 5,
    title: 'Renaissance Art: A New Perspective',
    extract: 'Discover how Renaissance artists revolutionized visual expression and shaped Western art forever.',
    category: 'Art',
    readingTimeMinutes: 4,
    isFeatured: false,
    imageUrl: null,
    language: 'en',
    funFact: 'The Mona Lisa has no visible eyebrows, which was common in Renaissance art.',
    isLiked: false,
    isBookmarked: false,
    likeCount: 432,
    url: 'https://en.wikipedia.org/wiki/Renaissance_art',
  },
]

export const mockArticlesFull: Record<string, ArticleFull> = {
  '1': {
    ...mockArticles[0],
    fullContent: `
      <h2>History</h2>
      <p>The history of artificial intelligence began in the 1950s when computer scientists started exploring whether machines could simulate human intelligence. The field was formally established as an academic discipline at the Dartmouth Summer Research Project on Artificial Intelligence in 1956.</p>
      <h3>Early Years (1950s–1970s)</h3>
      <p>In the early years, researchers were optimistic about AI. This period saw the development of the first AI programs, including the Logic Theorist and the General Problem Solver.</p>
      <h3>AI Winter (1970s–1980s)</h3>
      <p>As expectations didn't meet reality, funding dried up and the field entered what became known as the "AI Winter".</p>
      <h3>Modern Era (2000s–Present)</h3>
      <p>The 21st century has seen explosive growth in AI, driven by advances in machine learning, deep learning, and big data.</p>
    `,
  },
  '2': {
    ...mockArticles[1],
    fullContent: `
      <h2>Overview</h2>
      <p>Ancient Rome was a civilization centered on the city of Rome that began on the Italian Peninsula as early as the 8th century BC.</p>
      <h3>The Kingdom of Rome (753–509 BC)</h3>
      <p>According to legend, Rome was founded on April 21, 753 BC by Romulus and ruled by kings until 509 BC.</p>
      <h3>The Roman Republic (509–27 BC)</h3>
      <p>During this period, Rome expanded its territory and influence across the Mediterranean.</p>
      <h3>The Roman Empire (27 BC–476 AD)</h3>
      <p>Augustus became the first emperor, inaugurating the Roman Empire at its greatest territorial extent.</p>
      <h3>Fall of Rome</h3>
      <p>The Western Roman Empire fell in 476 AD due to political instability, economic troubles, and invasions by Germanic tribes.</p>
    `,
  },
}

export const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'John Doe',
  avatar: null,
  createdAt: '2024-01-15T00:00:00Z',
  articlesRead: 142,
  currentStreak: 7,
  interests: ['Science', 'Technology', 'History'],
  readingTimePreference: 'standard' as const,
}

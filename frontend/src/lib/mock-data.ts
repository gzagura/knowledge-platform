import { ArticleCard, ArticleFull } from '@/types/article'

export const mockArticles: ArticleCard[] = [
  {
    id: '1',
    title: 'The History of Artificial Intelligence',
    extract: 'Explore the fascinating journey of AI from its philosophical roots to modern machine learning.',
    category: 'Technology',
    readingTime: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'The term "Artificial Intelligence" was coined in 1956 at the Dartmouth Summer Research Project.',
    liked: false,
    bookmarked: false,
    likeCount: 342,
  },
  {
    id: '2',
    title: 'Ancient Rome: Rise and Fall of an Empire',
    extract: 'Discover how Rome transformed from a small city-state to one of history\'s greatest empires.',
    category: 'History',
    readingTime: 8,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'Ancient Romans invented concrete, which is still used in modern construction.',
    liked: false,
    bookmarked: false,
    likeCount: 521,
  },
  {
    id: '3',
    title: 'The Human Brain: Unlocking Its Mysteries',
    extract: 'Understanding the most complex organ in the human body and how it controls our thoughts and actions.',
    category: 'Science',
    readingTime: 6,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'The human brain contains approximately 86 billion neurons.',
    liked: false,
    bookmarked: false,
    likeCount: 789,
  },
  {
    id: '4',
    title: 'Climate Change: Past, Present, and Future',
    extract: 'A comprehensive look at global climate patterns, human impact, and the path toward sustainable solutions.',
    category: 'Geography',
    readingTime: 7,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'The Antarctic ice sheet holds about 90% of the world\'s ice.',
    liked: false,
    bookmarked: false,
    likeCount: 654,
  },
  {
    id: '5',
    title: 'Renaissance Art: A New Perspective',
    extract: 'Discover how Renaissance artists revolutionized visual expression and shaped Western art forever.',
    category: 'Art',
    readingTime: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'The Mona Lisa has no visible eyebrows, which was common in Renaissance art.',
    liked: false,
    bookmarked: false,
    likeCount: 432,
  },
]

export const mockArticlesFull: Record<string, ArticleFull> = {
  '1': {
    id: '1',
    title: 'The History of Artificial Intelligence',
    extract: 'Explore the fascinating journey of AI from its philosophical roots to modern machine learning.',
    category: 'Technology',
    readingTime: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'The term "Artificial Intelligence" was coined in 1956 at the Dartmouth Summer Research Project.',
    liked: false,
    bookmarked: false,
    likeCount: 342,
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    content: `
      <h2>History</h2>
      <p>The history of artificial intelligence began in the 1950s when computer scientists started exploring whether machines could simulate human intelligence. The field was formally established as an academic discipline at the Dartmouth Summer Research Project on Artificial Intelligence in 1956.</p>

      <h3>Early Years (1950s-1970s)</h3>
      <p>In the early years, researchers were optimistic about the prospects of AI. They believed that human intelligence could be precisely described and could be simulated by a machine. This period saw the development of the first AI programs, including the Logic Theorist and the General Problem Solver.</p>

      <h3>AI Winter (1970s-1980s)</h3>
      <p>As expectations didn't meet reality, funding dried up and the field entered what became known as the "AI Winter" - a period of reduced funding and interest in AI research.</p>

      <h3>Expert Systems (1980s-1990s)</h3>
      <p>The 1980s saw a resurgence in AI research with the development of expert systems - programs that captured human expertise in specific domains.</p>

      <h3>Modern Era (2000s-Present)</h3>
      <p>The 21st century has seen explosive growth in AI, driven by advances in machine learning, deep learning, and big data. Applications range from virtual assistants to autonomous vehicles.</p>
    `,
    author: 'Wikipedia Contributors',
    lastModified: '2024-03-01',
    views: 15000,
  },
  '2': {
    id: '2',
    title: 'Ancient Rome: Rise and Fall of an Empire',
    extract: 'Discover how Rome transformed from a small city-state to one of history\'s greatest empires.',
    category: 'History',
    readingTime: 8,
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    funFact: 'Ancient Romans invented concrete, which is still used in modern construction.',
    liked: false,
    bookmarked: false,
    likeCount: 521,
    url: 'https://en.wikipedia.org/wiki/Ancient_Rome',
    content: `
      <h2>Overview</h2>
      <p>Ancient Rome was a civilization centered on the city of Rome that began on the Italian Peninsula as early as the 8th century BC. It was a polytheistic civilization and served as one of the greatest influential societies of the world.</p>

      <h3>The Kingdom of Rome (753-509 BC)</h3>
      <p>According to legend, Rome was founded on April 21, 753 BC by Romulus. The city was ruled by kings until 509 BC when the last king was overthrown.</p>

      <h3>The Roman Republic (509-27 BC)</h3>
      <p>The establishment of the Roman Republic marked the beginning of a new era. During this period, Rome expanded its territory and influence across the Mediterranean.</p>

      <h3>The Roman Empire (27 BC-476 AD)</h3>
      <p>Augustus became the first emperor of Rome, inaugurating the Roman Empire. This period saw Rome reach its greatest territorial extent and cultural achievements.</p>

      <h3>Fall of Rome</h3>
      <p>The Western Roman Empire fell in 476 AD due to a combination of political instability, economic troubles, and invasions by Germanic tribes.</p>
    `,
    author: 'Wikipedia Contributors',
    lastModified: '2024-02-28',
    views: 22000,
  },
}

export const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'John Doe',
  avatar: 'https://api.example.com/avatars/user-1.jpg',
  createdAt: '2024-01-15T00:00:00Z',
  articlesRead: 142,
  currentStreak: 7,
  interests: ['Science', 'Technology', 'History'],
  readingTimePreference: 'standard' as const,
}

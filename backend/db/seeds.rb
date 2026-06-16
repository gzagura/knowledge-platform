# Seed a handful of articles so the feed works without waiting for Wikipedia
puts 'Seeding sample articles...'

sample_articles = [
  {
    wikipedia_id: 1181850,
    title: 'Artificial Intelligence',
    extract: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.',
    full_content: 'Artificial intelligence (AI) is intelligence demonstrated by machines. Modern AI techniques include machine learning, deep learning, neural networks, and natural language processing. These technologies power applications ranging from virtual assistants to autonomous vehicles.',
    language: 'en',
    category: 'Technology',
    reading_time_minutes: 8,
    is_featured: true,
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
  },
  {
    wikipedia_id: 18963,
    title: 'Ancient Rome',
    extract: 'In historiography, ancient Rome describes Roman civilization from the founding of the Italian city of Rome in the 8th century BC to the collapse of the Western Roman Empire in the 5th century AD. It encompasses the Roman Kingdom (753–509 BC), the Roman Republic (509–27 BC), and the Roman Empire (27 BC – 476 AD).',
    full_content: 'Ancient Rome was one of the most significant civilizations in world history. At its height, the Roman Empire stretched from Britain to Mesopotamia. Roman contributions to law, architecture, engineering, and governance continue to influence modern civilization.',
    language: 'en',
    category: 'History',
    reading_time_minutes: 10,
    is_featured: true,
    url: 'https://en.wikipedia.org/wiki/Ancient_Rome'
  },
  {
    wikipedia_id: 25201,
    title: 'Human Brain',
    extract: 'The human brain is the central organ of the human nervous system, and with the spinal cord makes up the central nervous system. The brain consists of the cerebrum, the brainstem and the cerebellum. It controls most of the activities of the body, processing, integrating and coordinating the information it receives from the sense organs.',
    full_content: 'The human brain is one of the most complex structures in the known universe. With approximately 86 billion neurons forming trillions of connections, the brain processes sensory information, controls movement, and gives rise to consciousness itself.',
    language: 'en',
    category: 'Science',
    reading_time_minutes: 7,
    is_featured: false,
    url: 'https://en.wikipedia.org/wiki/Human_brain'
  },
  {
    wikipedia_id: 45560,
    title: 'Quantum Computing',
    extract: 'A quantum computer is a computer that exploits quantum mechanical phenomena. At small scales, physical matter exhibits properties of both particles and waves, and quantum computing leverages this behavior using specialized hardware. Classical physics cannot explain the operation of these quantum devices.',
    full_content: 'Quantum computing represents a fundamentally new paradigm in computation. Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in superposition states. This allows quantum computers to solve certain problems exponentially faster than classical computers.',
    language: 'en',
    category: 'Technology',
    reading_time_minutes: 6,
    is_featured: false,
    url: 'https://en.wikipedia.org/wiki/Quantum_computing'
  },
  {
    wikipedia_id: 34593,
    title: 'Mozart',
    extract: 'Wolfgang Amadeus Mozart (27 January 1756 – 5 December 1791) was a prolific and influential composer of the Classical period. Despite his short life, his rapid pace of composition resulted in more than 800 works representing virtually every Western classical genre of his time.',
    full_content: 'Wolfgang Amadeus Mozart composed over 800 works in his brief 35-year life. His operas, symphonies, concertos, and chamber music remain cornerstones of Western classical music. His unique blend of beauty, depth, and technical mastery has rarely been equaled.',
    language: 'en',
    category: 'Music',
    reading_time_minutes: 5,
    is_featured: false,
    url: 'https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart'
  }
]

sample_articles.each do |attrs|
  Article.find_or_create_by(wikipedia_id: attrs[:wikipedia_id], language: attrs[:language]) do |a|
    a.assign_attributes(attrs)
  end
end

puts "Seeded #{Article.count} articles."

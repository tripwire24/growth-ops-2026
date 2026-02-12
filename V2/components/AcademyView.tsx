// ==========================================
// AcademyView — Growth Hacking Learning Hub
// ==========================================
import React, { useState } from 'react';
import { 
  BookOpen, Lightbulb, Target, BarChart3, Beaker, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Trophy, Layers, CheckCircle, 
  GraduationCap, Clock, Star
} from 'lucide-react';

// --- Lesson Content ---
interface Lesson {
  id: string;
  title: string;
  category: 'fundamentals' | 'frameworks' | 'metrics' | 'advanced';
  duration: string;
  icon: React.ReactNode;
  summary: string;
  content: ContentBlock[];
}

interface ContentBlock {
  type: 'heading' | 'paragraph' | 'tip' | 'example' | 'checklist';
  text: string;
  items?: string[];
}

const LESSONS: Lesson[] = [
  {
    id: 'what-is-growth',
    title: 'What Is Growth Hacking?',
    category: 'fundamentals',
    duration: '4 min read',
    icon: <Lightbulb size={20} />,
    summary: 'Growth hacking is a process of rapid experimentation across marketing, product, and engineering to find the most efficient ways to grow a business.',
    content: [
      { type: 'heading', text: 'The Mindset' },
      { type: 'paragraph', text: 'Growth hacking isn\'t a bag of tricks — it\'s a systematic, experiment-driven approach to growing your product. Instead of relying on intuition, you form hypotheses, test them quickly, measure results, and iterate.' },
      { type: 'tip', text: 'The best growth teams run 15-20 experiments per month. Speed of learning is the real competitive advantage.' },
      { type: 'heading', text: 'The Growth Loop' },
      { type: 'paragraph', text: 'Every growth strategy follows a loop: Brainstorm → Prioritize → Test → Analyze → Repeat. This tool helps you manage that loop with Kanban boards, ICE scoring, and metric tracking.' },
      { type: 'checklist', text: 'Growth Hacking Essentials', items: [
        'Data-driven decision making over gut feeling',
        'Rapid experimentation cadence (weekly sprints)',
        'Cross-functional collaboration (product + marketing + engineering)',
        'Focus on the full funnel, not just acquisition',
        'Document every learning — wins AND losses',
      ]},
    ],
  },
  {
    id: 'ice-scoring',
    title: 'ICE Scoring Framework',
    category: 'frameworks',
    duration: '5 min read',
    icon: <Target size={20} />,
    summary: 'ICE stands for Impact, Confidence, and Ease — a simple 1-10 scoring system to prioritize which experiments to run first.',
    content: [
      { type: 'heading', text: 'How ICE Works' },
      { type: 'paragraph', text: 'Each experiment gets three scores from 1-10:' },
      { type: 'checklist', text: 'ICE Dimensions', items: [
        'Impact — How much will this move the needle if it works?',
        'Confidence — How confident are you that this will succeed?',
        'Ease — How easy/fast is this to implement and measure?',
      ]},
      { type: 'paragraph', text: 'The average of these three scores gives you a composite ICE score. Higher scores = higher priority. It\'s not a perfect science, but it creates a shared language for your team to debate priorities.' },
      { type: 'tip', text: 'Don\'t overthink the scores. The value is in the conversation, not the precision of the number. A quick 2-minute scoring exercise beats a 2-hour debate.' },
      { type: 'heading', text: 'When to Use Custom Dimensions' },
      { type: 'paragraph', text: 'ICE works great for most teams, but sometimes you need custom scoring dimensions. For example, an enterprise team might add "Strategic Alignment" or "Revenue Potential." Use the Board Settings to configure custom dimensions when standard ICE doesn\'t capture your priorities.' },
      { type: 'example', text: 'Example: A SaaS team scores "Onboarding Wizard" as Impact: 9, Confidence: 7, Ease: 4 = ICE Score 6.7. This means high potential but moderate implementation difficulty — perfect for a dedicated sprint.' },
    ],
  },
  {
    id: 'metrics-that-matter',
    title: 'Choosing Metrics That Matter',
    category: 'metrics',
    duration: '6 min read',
    icon: <BarChart3 size={20} />,
    summary: 'Learn how to pick the right tracking metrics for your experiments — baseline, target, and how to measure success.',
    content: [
      { type: 'heading', text: 'The Baseline → Target → Actual Framework' },
      { type: 'paragraph', text: 'Every experiment should have clear metrics with three values:' },
      { type: 'checklist', text: 'Metric Components', items: [
        'Baseline — Where is the metric today? (e.g., 3.2% conversion rate)',
        'Target — What would "success" look like? (e.g., 5.0% conversion rate)',
        'Actual — What did we actually achieve? (filled in post-experiment)',
      ]},
      { type: 'paragraph', text: 'This framework prevents the "everything is a success!" trap. By committing to targets upfront, you create honest accountability and real learning.' },
      { type: 'tip', text: 'Configure your board\'s tracking metrics in Board Settings. Common metrics: Conversion Rate, MRR, CAC, LTV, Churn Rate, NPS, DAU, ARPU.' },
      { type: 'heading', text: 'Leading vs Lagging Indicators' },
      { type: 'paragraph', text: 'Leading indicators predict future results (e.g., signups, activation rate). Lagging indicators confirm outcomes (e.g., revenue, LTV). The best experiment metrics are leading indicators — they give you faster feedback.' },
      { type: 'example', text: 'Example: Instead of measuring "revenue increase" (lagging, takes months), measure "free-to-paid conversion rate" (leading, measurable in days). Both track monetization, but the leading indicator gives you faster signal.' },
    ],
  },
  {
    id: 'experiment-lifecycle',
    title: 'Running an Experiment End-to-End',
    category: 'frameworks',
    duration: '7 min read',
    icon: <Beaker size={20} />,
    summary: 'A step-by-step guide to running experiments from idea through to documented learnings.',
    content: [
      { type: 'heading', text: 'The 5-Stage Pipeline' },
      { type: 'paragraph', text: 'Your Kanban board mirrors the experiment lifecycle:' },
      { type: 'checklist', text: 'Experiment Stages', items: [
        '💡 Idea/Backlog — Raw ideas, unvalidated. Capture everything.',
        '🔍 Prioritized — Scored with ICE, ready for sprint planning. Has a clear hypothesis.',
        '🔨 Running — Active experiment, data being collected. Duration defined.',
        '✅ Complete — Data collected, outcome determined (Won / Lost / Inconclusive).',
        '📚 Learnings — Documented insights, locked for posterity. What did we learn?',
      ]},
      { type: 'heading', text: 'Writing a Good Hypothesis' },
      { type: 'paragraph', text: 'Use this template: "If we [action], then [expected outcome] because [reasoning]." This forces clarity about what you\'re testing and why.' },
      { type: 'example', text: 'Example: "If we add social proof badges to the pricing page, then upgrade conversion will increase by 15% because users trust peer validation more than marketing copy."' },
      { type: 'heading', text: 'Documenting Learnings' },
      { type: 'paragraph', text: 'The most underrated part of experimentation. When an experiment completes, document: What happened? Why did it work/fail? What would you do differently? This compounds into organizational knowledge.' },
      { type: 'tip', text: 'Lost experiments are as valuable as wins. A well-documented failure prevents the next team from repeating the same mistake.' },
    ],
  },
  {
    id: 'pirate-metrics',
    title: 'AARRR Pirate Metrics',
    category: 'metrics',
    duration: '5 min read',
    icon: <Layers size={20} />,
    summary: 'Dave McClure\'s AARRR framework maps the full customer funnel: Acquisition, Activation, Retention, Revenue, Referral.',
    content: [
      { type: 'heading', text: 'The Five Stages' },
      { type: 'checklist', text: 'AARRR Framework', items: [
        'Acquisition — How do users find you? (SEO, ads, content, partnerships)',
        'Activation — Do they have a great first experience? (onboarding, aha moment)',
        'Retention — Do they come back? (DAU/MAU ratio, session frequency)',
        'Revenue — Do they pay? (conversion rate, ARPU, LTV)',
        'Referral — Do they tell others? (NPS, viral coefficient, share rate)',
      ]},
      { type: 'paragraph', text: 'Most teams over-invest in Acquisition and under-invest in Activation and Retention. Fix your leaky bucket before pouring more water in.' },
      { type: 'tip', text: 'Map each experiment to an AARRR stage using the "Type" field. This helps your analytics dashboard show where your team is focusing.' },
      { type: 'example', text: 'Example: If your analytics show 80% of experiments are "Acquisition" type but your churn rate is 15%, you need to rebalance toward Retention experiments.' },
    ],
  },
  {
    id: 'velocity-culture',
    title: 'Building a High-Velocity Team',
    category: 'advanced',
    duration: '6 min read',
    icon: <Zap size={20} />,
    summary: 'How the best growth teams maintain experimentation velocity and create a culture of continuous learning.',
    content: [
      { type: 'heading', text: 'Velocity Is the #1 Metric' },
      { type: 'paragraph', text: 'The number of experiments you run per month is the strongest predictor of growth team success. High-velocity teams (15+ experiments/month) consistently outperform slow ones, regardless of individual experiment quality.' },
      { type: 'tip', text: 'Track your 30-day velocity in the Analytics dashboard. If it drops below 4, your team might be over-planning and under-testing.' },
      { type: 'heading', text: 'Common Velocity Killers' },
      { type: 'checklist', text: 'Watch out for:', items: [
        'Perfectionism — "Let\'s wait until the design is perfect"',
        'Analysis paralysis — Over-debating ICE scores',
        'Missing baselines — Can\'t measure what you don\'t track',
        'No dedicated experiment time — Experiments lose to feature work',
        'Fear of failure — Teams avoid risky experiments',
      ]},
      { type: 'heading', text: 'Cultural Practices' },
      { type: 'checklist', text: 'Habits of great growth teams:', items: [
        'Weekly experiment review meetings (30 min max)',
        'Celebrate learnings from failures, not just wins',
        'Everyone can propose an experiment, not just senior staff',
        'Time-boxed experiments (max 2 weeks per test)',
        'Public dashboard showing team velocity and win rate',
      ]},
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Lessons', icon: <BookOpen size={14} /> },
  { id: 'fundamentals', label: 'Fundamentals', icon: <GraduationCap size={14} /> },
  { id: 'frameworks', label: 'Frameworks', icon: <Layers size={14} /> },
  { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={14} /> },
  { id: 'advanced', label: 'Advanced', icon: <Zap size={14} /> },
];

// --- Content Block Renderer ---
const ContentBlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return <h4 className="text-base font-bold text-slate-800 dark:text-white mt-6 mb-2">{block.text}</h4>;
    case 'paragraph':
      return <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{block.text}</p>;
    case 'tip':
      return (
        <div className="flex gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 my-3">
          <Lightbulb size={16} className="text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{block.text}</p>
        </div>
      );
    case 'example':
      return (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 my-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 italic">{block.text}</p>
        </div>
      );
    case 'checklist':
      return (
        <div className="my-3">
          {block.text && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{block.text}</p>}
          <ul className="space-y-1.5">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
};

// --- Lesson Card ---
const LessonCard: React.FC<{
  lesson: Lesson;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ lesson, isExpanded, onToggle }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border ${isExpanded ? 'border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-800'} shadow-sm transition-all duration-200 overflow-hidden`}>
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isExpanded 
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}>
          {lesson.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{lesson.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{lesson.summary}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock size={10} /> {lesson.duration}
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-6 border-t border-slate-100 dark:border-slate-800">
          <div className="pt-4 pl-14">
            {lesson.content.map((block, i) => (
              <ContentBlockRenderer key={i} block={block} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Academy View ---
export const AcademyView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedLesson, setExpandedLesson] = useState<string | null>('what-is-growth');

  const filteredLessons = activeCategory === 'all' 
    ? LESSONS 
    : LESSONS.filter(l => l.category === activeCategory);

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Growth Academy</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Master the fundamentals of growth experimentation</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star size={16} className="text-amber-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-white">{LESSONS.length}</strong> lessons available
            </span>
          </div>
          <span className="text-xs text-slate-400">
            ~{LESSONS.reduce((acc, l) => acc + parseInt(l.duration), 0)} min total
          </span>
        </div>

        {/* Lesson List */}
        <div className="space-y-3">
          {filteredLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isExpanded={expandedLesson === lesson.id}
              onToggle={() => setExpandedLesson(prev => prev === lesson.id ? null : lesson.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

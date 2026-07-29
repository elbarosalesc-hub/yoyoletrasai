export type MetricTone = 'violet' | 'mint' | 'blue' | 'yellow';

export interface DashboardMetric {
  id: 'students' | 'activities' | 'learning-time' | 'achievements';
  label: string;
  value: string;
  detail: string;
  period: string;
  tone: MetricTone;
}

export interface FeaturedGame {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  skill: string;
  levels: number;
  progressPercent: number;
  cluesFound: number;
  cluesTotal: number;
  artworkUrl: string;
  canPreview: boolean;
}

export interface UpcomingActivity {
  id: string;
  title: string;
  level: string;
  subject: string;
  dueDateLabel: string;
  thumbnailUrl: string;
}

export interface QuickAction {
  id: 'new-activity' | 'resources' | 'yoyo' | 'report';
  label: string;
  href: string;
  icon: string;
}

export interface TeacherDashboardViewModel {
  teacherDisplayName: string;
  unreadNotifications: number;
  metrics: DashboardMetric[];
  featuredGame: FeaturedGame;
  upcomingActivities: UpcomingActivity[];
  quickActions: QuickAction[];
}

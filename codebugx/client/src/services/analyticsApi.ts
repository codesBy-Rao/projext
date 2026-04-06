import api from './api'

export type WeeklyPoint = {
  date: string
  count: number
}

export type WeakTopic = {
  topic: string
  weaknessScore: number
  bugCount: number
  totalSubmissions: number
  trend: 'improving' | 'stable' | 'declining'
}

export type OverviewData = {
  totalSubmissions: number
  mostFrequentBug: {
    bugType: string
    topic: string
    severity: 'low' | 'medium' | 'high'
    frequency: number
  } | null
  weeklyTrend: WeeklyPoint[]
  weakTopics: WeakTopic[]
}

export type CoachHint = {
  level: 1 | 2 | 3
  title: string
  content: string
}

export type CoachInsights = {
  dailyMission: {
    topic: string
    targetSubmissions: number
    completedToday: number
    targetBugReductionPercent: number
    message: string
  }
  weeklyProgress: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'E'
    consistency: number
    streakDays: number
    trend: 'improving' | 'stable' | 'declining'
  }
  hintPlan: {
    topic: string
    hints: CoachHint[]
  }
}

export type HistoryBug = {
  type: string
  severity: 'low' | 'medium' | 'high'
  topic: string
}

export type HistoryItem = {
  id: string
  language: string
  overallSeverity: 'none' | 'low' | 'medium' | 'high'
  analyzedAt: string
  bugCount: number
  detectedBugs: HistoryBug[]
  codePreview: string
}

export type HistoryPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type HistoryResponse = {
  status: string
  data: {
    items: HistoryItem[]
    pagination: HistoryPagination
  }
}

type OverviewResponse = {
  status: string
  data: OverviewData
}

type CoachInsightsResponse = {
  status: string
  data: CoachInsights
}

export const getAnalyticsOverview = async () => {
  const response = await api.get<OverviewResponse>('/analytics/overview')
  return response.data.data
}

export const getCoachInsights = async () => {
  const response = await api.get<CoachInsightsResponse>('/analytics/coach')
  return response.data.data
}

export const getSubmissionHistory = async (page = 1, limit = 8) => {
  const response = await api.get<HistoryResponse>('/history', {
    params: { page, limit },
  })
  return response.data.data
}

import api from './api'

export type AnalyzeRequest = {
  codeSnippet: string
  language: string
}

export type AnalyzeBug = {
  type: string
  severity: 'low' | 'medium' | 'high'
  topic: string
}

export type AnalyzeResponse = {
  status: string
  data: {
    id: string
    submissionId: string
    language: string
    bugs: AnalyzeBug[]
    overallSeverity: 'none' | 'low' | 'medium' | 'high'
    analytics?: {
      topicsUpdated: Array<{
        topic: string
        totalSubmissions: number
        bugCount: number
        weaknessScore: number
        trend: 'improving' | 'stable' | 'declining'
      }>
    }
    createdAt: string
  }
}

export const analyzeCode = async (payload: AnalyzeRequest) => {
  const response = await api.post<AnalyzeResponse>('/analyze', payload)
  return response.data
}

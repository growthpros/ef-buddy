import { NextRequest, NextResponse } from 'next/server'

// 2-A Task Classifier Prompt
const TASK_CLASSIFIER_PROMPT = `You are my Task Classification AI. I have ADHD, so realistic time estimates and "good enough" completion criteria are crucial.

TASK: Analyze raw text input and classify it as a task with structured metadata.

INPUT: Raw text (could be messy, incomplete, stream-of-consciousness)

CLASSIFICATION RULES:
1. TIME ESTIMATE: Realistic range 20-240 minutes. For ADHD brains, add 25% buffer to initial estimates.
2. URGENCY: Scale 1-5 (1=whenever, 5=today/ASAP)
3. IMPACT: Scale 1-5 (1=minor, 5=major consequences if not done)
4. COMPLETION CRITERIA: Define "good enough" (80% rule) - what would be acceptable completion, not perfect completion.

IMPORTANT: If the text is unclear or lacks context, make reasonable assumptions based on common ADHD task patterns. Focus on being helpful rather than asking for clarification.

Return ONLY valid JSON in this exact format:
{
  "task_title": "Clean, actionable version of the input",
  "time_estimate": 60,
  "urgency_score": 3,
  "impact_score": 2,
  "completion_criteria": "Good enough definition focusing on 80% completion",
  "suggested_priority": "medium",
  "energy_level": 3,
  "breakdown_steps": ["First step", "Second step", "Third step"],
  "confidence": 0.85
}`

interface ClassifyTaskRequest {
  text: string
}

interface ClassifyTaskResponse {
  task_title: string
  time_estimate: number
  urgency_score: number
  impact_score: number
  completion_criteria: string
  suggested_priority: 'low' | 'medium' | 'high' | 'urgent'
  energy_level: number
  breakdown_steps: string[]
  confidence: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ClassifyTaskRequest = await request.json()
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required and must be a string' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll simulate AI classification
    // In production, this would call an actual AI service (OpenAI, Anthropic, etc.)
    const classifiedTask = await classifyTaskWithAI(body.text)
    
    return NextResponse.json(classifiedTask)
  } catch (error) {
    console.error('Task classification error:', error)
    return NextResponse.json(
      { error: 'Failed to classify task' },
      { status: 500 }
    )
  }
}

async function classifyTaskWithAI(text: string): Promise<ClassifyTaskResponse> {
  // Enhanced rule-based classification with more dynamic analysis
  const cleanTitle = text.trim().replace(/\s+/g, ' ')
  const lowerText = text.toLowerCase()
  const wordCount = cleanTitle.split(' ').length
  
  // Dynamic keyword analysis with weights
  const urgentKeywords = [
    { word: 'asap', weight: 2.0, urgency: 5 },
    { word: 'urgent', weight: 1.8, urgency: 5 },
    { word: 'emergency', weight: 2.0, urgency: 5 },
    { word: 'today', weight: 1.5, urgency: 4 },
    { word: 'deadline', weight: 1.7, urgency: 4 },
    { word: 'due', weight: 1.4, urgency: 4 },
    { word: 'tomorrow', weight: 1.3, urgency: 4 },
  ]
  
  const complexityKeywords = [
    { word: 'research', timeMultiplier: 2.5, energy: 4 },
    { word: 'analyze', timeMultiplier: 2.0, energy: 4 },
    { word: 'project', timeMultiplier: 3.0, energy: 4 },
    { word: 'presentation', timeMultiplier: 2.2, energy: 4 },
    { word: 'report', timeMultiplier: 2.0, energy: 3 },
    { word: 'meeting', timeMultiplier: 1.0, energy: 3 },
    { word: 'call', timeMultiplier: 0.8, energy: 2 },
    { word: 'email', timeMultiplier: 0.5, energy: 2 },
    { word: 'quick', timeMultiplier: 0.4, energy: 2 },
    { word: 'brief', timeMultiplier: 0.5, energy: 2 },
    { word: 'organize', timeMultiplier: 1.5, energy: 2 },
    { word: 'clean', timeMultiplier: 1.2, energy: 2 },
    { word: 'fix', timeMultiplier: 1.8, energy: 3 },
    { word: 'debug', timeMultiplier: 2.5, energy: 4 },
    { word: 'brainstorm', timeMultiplier: 1.5, energy: 4 },
    { word: 'creative', timeMultiplier: 2.0, energy: 4 },
    { word: 'design', timeMultiplier: 2.5, energy: 4 },
    { word: 'write', timeMultiplier: 2.0, energy: 3 },
  ]
  
  const impactKeywords = [
    { word: 'client', impact: 5 },
    { word: 'customer', impact: 5 },
    { word: 'boss', impact: 4 },
    { word: 'manager', impact: 4 },
    { word: 'team', impact: 4 },
    { word: 'company', impact: 4 },
    { word: 'personal', impact: 2 },
    { word: 'hobby', impact: 1 },
    { word: 'optional', impact: 2 },
  ]

  // Calculate base time estimate (20-240 minute range)
  let baseTime = 45 // Base 45 minutes
  let timeMultiplier = 1.0
  let energyLevel = 3
  let impactScore = 3
  let urgencyScore = 3
  
  // Analyze complexity and adjust time/energy
  for (const keyword of complexityKeywords) {
    if (lowerText.includes(keyword.word)) {
      timeMultiplier = Math.max(timeMultiplier, keyword.timeMultiplier)
      energyLevel = Math.max(energyLevel, keyword.energy)
    }
  }
  
  // Adjust for word count (longer descriptions = more complex)
  if (wordCount > 10) {
    timeMultiplier *= 1.3
    energyLevel = Math.min(5, energyLevel + 1)
  } else if (wordCount <= 3) {
    timeMultiplier *= 0.7
    energyLevel = Math.max(1, energyLevel - 1)
  }
  
  // Calculate urgency with weights
  let urgencyWeight = 0
  for (const keyword of urgentKeywords) {
    if (lowerText.includes(keyword.word)) {
      urgencyWeight += keyword.weight
      urgencyScore = Math.max(urgencyScore, keyword.urgency)
    }
  }
  
  // Analyze impact
  for (const keyword of impactKeywords) {
    if (lowerText.includes(keyword.word)) {
      impactScore = Math.max(impactScore, keyword.impact)
    }
  }
  
  // Calculate final time estimate with ADHD buffer
  let timeEstimate = Math.round(baseTime * timeMultiplier * 1.25) // 25% ADHD buffer
  
  // Ensure within realistic bounds (20-240 minutes)
  timeEstimate = Math.min(240, Math.max(20, timeEstimate))
  
  // Determine priority based on urgency and impact
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  if (urgencyScore >= 5) {
    priority = 'urgent'
  } else if (urgencyScore >= 4 || impactScore >= 4) {
    priority = 'high'
  } else if (urgencyScore <= 2 && impactScore <= 2) {
    priority = 'low'
  }
  
  // Calculate confidence based on keyword matches and text quality
  let confidence = 0.6 // Base confidence
  if (urgencyWeight > 0) confidence += 0.15
  if (timeMultiplier !== 1.0) confidence += 0.1
  if (wordCount >= 4) confidence += 0.1
  if (wordCount >= 8) confidence += 0.05
  
  // Cap confidence at 0.95
  confidence = Math.min(0.95, confidence)
  
  // Generate completion criteria
  const completionCriteria = generateCompletionCriteria(cleanTitle, priority)
  
  // Generate breakdown steps
  const breakdownSteps = generateBreakdownSteps(cleanTitle, lowerText)
  
  return {
    task_title: cleanTitle,
    time_estimate: timeEstimate,
    urgency_score: Math.min(5, Math.max(1, urgencyScore)),
    impact_score: Math.min(5, Math.max(1, impactScore)),
    completion_criteria: completionCriteria,
    suggested_priority: priority,
    energy_level: Math.min(5, Math.max(1, energyLevel)),
    breakdown_steps: breakdownSteps,
    confidence: Math.round(confidence * 100) / 100 // Round to 2 decimal places
  }
}

function generateCompletionCriteria(title: string, priority: string): string {
  const templates = {
    urgent: "Task is complete when immediate requirements are met - doesn't need to be perfect, just functional.",
    high: "Done when key objectives are achieved at 80% quality - good enough to move forward.",
    medium: "Finished when main goal is accomplished satisfactorily - avoid perfectionism.",
    low: "Complete when basic requirements are fulfilled - minimal viable outcome is acceptable."
  }
  
  return templates[priority as keyof typeof templates] || templates.medium
}

function generateBreakdownSteps(title: string, lowerText: string): string[] {
  // Enhanced step generation based on task patterns
  
  // Email/Communication tasks
  if (lowerText.includes('email') || lowerText.includes('message') || lowerText.includes('text')) {
    return [
      "Draft the main message content",
      "Review tone and clarity",
      "Send or schedule delivery"
    ]
  }
  
  // Meeting/Call tasks
  if (lowerText.includes('meeting') || lowerText.includes('call') || lowerText.includes('discuss')) {
    return [
      "Prepare agenda or talking points",
      "Join/attend the meeting",
      "Document key decisions and next steps"
    ]
  }
  
  // Research tasks
  if (lowerText.includes('research') || lowerText.includes('look up') || lowerText.includes('find out')) {
    return [
      "Define specific information needed",
      "Search reliable sources and take notes",
      "Organize findings into summary"
    ]
  }
  
  // Writing tasks
  if (lowerText.includes('write') || lowerText.includes('draft') || lowerText.includes('compose')) {
    return [
      "Create outline or structure",
      "Write first draft focusing on content",
      "Review and edit for clarity"
    ]
  }
  
  // Presentation tasks
  if (lowerText.includes('presentation') || lowerText.includes('slides') || lowerText.includes('present')) {
    return [
      "Outline key points and structure",
      "Create slides with main content",
      "Practice delivery and timing"
    ]
  }
  
  // Creative/Design tasks
  if (lowerText.includes('design') || lowerText.includes('creative') || lowerText.includes('brainstorm')) {
    return [
      "Gather inspiration and requirements",
      "Create initial concepts or ideas",
      "Refine best option to completion"
    ]
  }
  
  // Organizing tasks
  if (lowerText.includes('organize') || lowerText.includes('clean') || lowerText.includes('sort')) {
    return [
      "Clear the space and gather supplies",
      "Sort items into keep/donate/discard",
      "Put everything in designated places"
    ]
  }
  
  // Fix/Debug tasks
  if (lowerText.includes('fix') || lowerText.includes('debug') || lowerText.includes('solve')) {
    return [
      "Reproduce the problem clearly",
      "Test potential solutions systematically",
      "Verify fix works and document"
    ]
  }
  
  // Planning tasks
  if (lowerText.includes('plan') || lowerText.includes('schedule') || lowerText.includes('organize')) {
    return [
      "List all requirements and constraints",
      "Create timeline with milestones",
      "Review and adjust for realism"
    ]
  }
  
  // Learning tasks
  if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('understand')) {
    return [
      "Find quality learning resources",
      "Take notes on key concepts",
      "Practice or apply what you learned"
    ]
  }
  
  // Default breakdown for other tasks
  return [
    "Break task into smaller concrete steps",
    "Start with the easiest or most important part",
    "Complete each step and celebrate progress"
  ]
}
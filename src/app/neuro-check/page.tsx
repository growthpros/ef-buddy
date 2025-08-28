'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Heart,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { InteractiveNeuroCheck } from '@/components/neuro-check/interactive-neuro-check'
import { Header } from '@/components/layout/header'
import { withAuth } from '@/contexts/auth-context'

function NeuroCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to EF Buddy
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              Daily Neuro-Check
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dynamic Capacity System - Track your mental state and let AI calculate your optimal daily capacity.
            </p>
          </div>
        </div>

        {/* Interactive Neuro-Check Widget */}
        <InteractiveNeuroCheck />

        {/* 1. Basic Spoon Theory Guide - Foundation First */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              🥄 Understanding "Spoons" - Your Daily Energy Units
            </CardTitle>
            <CardDescription>
              Learn how to estimate your energy and understand what the numbers mean
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
              <h4 className="font-semibold text-pink-900 mb-2">What is Spoon Theory?</h4>
              <p className="text-sm text-pink-800 mb-2">
                <strong>Spoon Theory</strong> was created by Christine Miserandus to explain chronic illness energy management. 
                It's widely used in ADHD/neurodivergent communities to understand daily energy limits.
              </p>
              <p className="text-sm text-pink-800">
                <strong>The concept:</strong> You wake up with limited "spoons" (energy units). Each task costs spoons. 
                When you're out of spoons, you're done - pushing further leads to burnout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">🌅 Morning Spoon Check</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>How many spoons did you wake up with today?</strong>
                </p>
                
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="font-medium text-green-900">8-10 Spoons: Great Morning</div>
                    <div className="text-sm text-green-700">
                      Slept well, feeling energized, ready to tackle challenging tasks and make decisions
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="font-medium text-blue-900">6-7 Spoons: Good Morning</div>
                    <div className="text-sm text-blue-700">
                      Normal energy, can handle regular tasks at a steady pace
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-900">4-5 Spoons: Low Energy</div>
                    <div className="text-sm text-yellow-700">
                      Need to pace yourself, focus on essentials, take more breaks
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <div className="font-medium text-red-900">1-3 Spoons: Survival Mode</div>
                    <div className="text-sm text-red-700">
                      Very low energy, gentle tasks only, consider this a rest day
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">⚡ Task Energy Costs</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>How many spoons do different tasks cost?</strong>
                </p>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">1 Spoon: Simple Tasks</div>
                    <div className="text-sm text-gray-700">
                      Checking email, making coffee, basic self-care
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">2 Spoons: Routine Tasks</div>
                    <div className="text-sm text-gray-700">
                      Grocery shopping, regular meetings, household chores
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">3 Spoons: Focused Work</div>
                    <div className="text-sm text-gray-700">
                      Concentrated tasks, difficult conversations, problem-solving
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">4+ Spoons: High Demands</div>
                    <div className="text-sm text-gray-700">
                      Presentations, major decisions, job interviews, complex projects
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </CardContent>
        </Card>

        {/* 2. How to Get More Spoons - Prominently Featured */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              📈 How to Get More Spoons (Capacity Expansion)
            </CardTitle>
            <CardDescription>
              Practical ways to increase your daily energy capacity sustainably
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg border border-green-300">
              <h4 className="font-semibold text-green-900 mb-3">🚀 High-Impact Spoon Boosters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <div className="font-medium text-green-900">💊 ADHD Medication Optimization</div>
                    <div className="text-sm text-green-800">+2-3 spoons daily</div>
                    <div className="text-xs text-green-700 mt-1">Work with doctor to find right type/dose</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="font-medium text-blue-900">🛌 Sleep Quality Improvement</div>
                    <div className="text-sm text-blue-800">+1-2 spoons daily</div>
                    <div className="text-xs text-blue-700 mt-1">7-9 hours, consistent schedule, sleep hygiene</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <div className="font-medium text-purple-900">🏃 Regular Exercise</div>
                    <div className="text-sm text-purple-800">+1-2 spoons daily</div>
                    <div className="text-xs text-purple-700 mt-1">Even 10-15 min walks help ADHD brains</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="font-medium text-orange-900">🧘 Stress Management</div>
                    <div className="text-sm text-orange-800">+1-2 spoons daily</div>
                    <div className="text-xs text-orange-700 mt-1">Meditation, therapy, breathing exercises</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/70 rounded border border-green-400">
                <p className="text-sm font-medium text-green-900">
                  🎯 <strong>Potential Total:</strong> 5-9 additional spoons daily with consistent implementation!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. ADHD-Specific Challenges */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              🧠 ADHD-Specific Spoon Challenges (You're Not Alone!)
            </CardTitle>
            <CardDescription>
              Targeted strategies for hyperfocus crashes and task transition struggles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
              <h4 className="font-semibold text-red-900 mb-3">⚡ Hyperfocus Sessions - The Double-Edged Sword</h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-red-200">
                  <div className="text-sm text-red-800 space-y-2">
                    <p><strong>The Problem:</strong> Feels like unlimited spoons during hyperfocus, but severe crashes follow</p>
                    <p><strong>What's Really Happening:</strong> You're using 2-3x normal spoon rate without realizing it</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="font-medium text-green-900 mb-2">🛡️ Hyperfocus Protection Strategies:</div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Set hourly alarms</strong> - Force breaks every 60-90 minutes</li>
                    <li>• <strong>Plan recovery time</strong> - Block next day for low-energy tasks</li>
                    <li>• <strong>Track the pattern</strong> - Note what triggers hyperfocus sessions</li>
                    <li>• <strong>Fuel properly</strong> - Eat, hydrate, move during breaks</li>
                    <li>• <strong>Accept the crash</strong> - It's normal, not a personal failure</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-yellow-900 mb-3">🔄 Task Transition Struggles - The Hidden Spoon Drain</h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-yellow-200">
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p><strong>The Problem:</strong> Switching between tasks feels impossible and drains extra spoons</p>
                    <p><strong>ADHD Reality:</strong> Task switching uses 0.5-1 extra spoon each time due to executive function load</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="font-medium text-blue-900 mb-2">⚙️ Transition Optimization Strategies:</div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Batch similar tasks</strong> - Group all emails, calls, or writing together</li>
                    <li>• <strong>Use transition rituals</strong> - 2-minute walk, deep breath, or song between tasks</li>
                    <li>• <strong>Time buffer zones</strong> - Add 15 min between scheduled tasks</li>
                    <li>• <strong>Visual task lists</strong> - Clear next step reduces decision fatigue</li>
                    <li>• <strong>Body doubling</strong> - Work alongside others for transition accountability</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
              <h4 className="font-semibold text-purple-900 mb-2">📊 Adjust Your Spoon Calculations</h4>
              <div className="text-sm text-purple-800 space-y-2">
                <p><strong>For Hyperfocus Days:</strong> Plan only 50% of normal tasks the next day</p>
                <p><strong>For High-Transition Days:</strong> Add 0.5 spoons per task switch to your estimates</p>
                <p><strong>For Social/Rejection Sensitivity:</strong> Double the spoon cost of people-heavy tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Connection to Task Triage */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              🔗 Connection to Task Triage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Yes! The energy levels in task triage match spoons:</h4>
              <div className="space-y-2">
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Task marked "3 energy" = 3 spoons required to complete</li>
                  <li>• Your daily capacity (from neuro-check) = total spoons available</li>
                  <li>• The system prevents over-scheduling beyond your spoon capacity</li>
                </ul>
                
                <div className="bg-white/70 p-3 rounded mt-3 border border-blue-300">
                  <strong className="text-blue-900">Example:</strong> 
                  <span className="text-blue-800"> You have 5 spoons today, but scheduled tasks need 8 spoons total → 
                  System warns you're overloaded and suggests moving some tasks to another day.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. How Dynamic Capacity System Adjusts Your Spoons */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              🧠 How Dynamic Capacity System Adjusts Your Spoons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">The system automatically adjusts based on your mental state:</h4>
              <div className="space-y-2">
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>Brain Fog:</strong> -2 spoons (thinking is harder today)</li>
                  <li>• <strong>Shutdown Mode:</strong> -4 spoons (overwhelmed, need recovery)</li>
                  <li>• <strong>Burnout Warning:</strong> -3 spoons when 3+ warning signs present</li>
                </ul>
                
                <div className="bg-white/70 p-3 rounded mt-3 border border-purple-300">
                  <strong className="text-purple-900">Real Example:</strong> 
                  <span className="text-purple-800"> Started with 7 spoons + Brain fog (-2) + 3 burnout signs (-3) = <strong>2 final spoons</strong></span>
                  <br />
                  <em className="text-purple-700">Perfect for: gentle self-care, rest, maybe one simple task. Avoid: meetings, decisions, complex work.</em>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Capacity Calculation Examples */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Capacity Calculation Examples
            </CardTitle>
            <CardDescription>
              See how the Dynamic Capacity System calculates your daily capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="font-medium text-green-900">Normal Day</div>
                  <div className="text-sm text-green-700">
                    7 energy units + Normal brain + 1 burnout flag = <strong>7 capacity</strong>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <div className="font-medium text-yellow-900">Foggy Day</div>
                  <div className="text-sm text-yellow-700">
                    6 energy units + Fog brain + 2 burnout flags = <strong>4 capacity</strong> (6-2)
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-900">Burnout Day</div>
                  <div className="text-sm text-orange-700">
                    5 energy units + Normal brain + 4 burnout flags = <strong>2 capacity</strong> (5-3)
                  </div>
                </div>
                
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <div className="font-medium text-red-900">Shutdown Day</div>
                  <div className="text-sm text-red-700">
                    4 energy units + Shutdown brain + 3 burnout flags = <strong>0 capacity</strong> (4-4-3, min 0)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Quick Reference: Spoons & Energy Matching */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Quick Reference: Spoons & Energy Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">In Neuro-Check (Morning)</h4>
                <p className="text-sm text-gray-700 mb-2"><strong>"Energy Units"</strong> = How many spoons you woke up with</p>
                <ul className="text-sm space-y-1">
                  <li>🟢 <strong>8-10:</strong> Great energy day</li>
                  <li>🔵 <strong>6-7:</strong> Normal energy day</li>
                  <li>🟡 <strong>4-5:</strong> Low energy, pace yourself</li>
                  <li>🔴 <strong>1-3:</strong> Survival mode, gentle day</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">In Task Triage (Planning)</h4>
                <p className="text-sm text-gray-700 mb-2"><strong>"Energy Required"</strong> = How many spoons this task costs</p>
                <ul className="text-sm space-y-1">
                  <li>1 spoon = Simple task (email, coffee)</li>
                  <li>2 spoons = Routine task (shopping, calls)</li>
                  <li>3 spoons = Focused work (writing, meetings)</li>
                  <li>4-5 spoons = High-demand task (presentations)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/70 rounded border border-green-300">
              <p className="text-sm font-medium text-green-900">
                💡 <strong>The Goal:</strong> Match your available spoons (from neuro-check) with your scheduled task costs (from triage) 
                to avoid overcommitting and prevent burnout!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 8. Can I Exceed My Daily Spoons? (Quick Answer) */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-orange-500" />
              ⚠️ Can I Exceed My Daily Spoons? (Quick Answer)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
                <h4 className="font-semibold text-yellow-900 mb-2">🔋 Yes, But With Consequences</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• You can "borrow" spoons for important deadlines</p>
                  <p>• Tomorrow you'll wake up with fewer spoons</p>
                  <p>• Risk of spoon debt cycle leading to burnout</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded border border-green-300">
                <h4 className="font-semibold text-green-900 mb-2">✅ Better Strategy: Expand Capacity</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• See the green section above for sustainable methods</p>
                  <p>• Focus on sleep, exercise, medication, stress management</p>
                  <p>• Grow from 7 spoons to 10+ spoons over time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

export default withAuth(NeuroCheckPage)
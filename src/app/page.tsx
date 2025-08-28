import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-900 mb-6">
            EF Buddy
          </h1>
          <p className="text-xl md:text-2xl text-secondary-700 mb-8 leading-relaxed">
            Executive Function Support for Neurodivergent Minds
          </p>
          <p className="text-lg text-secondary-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A thoughtfully designed self-management app that works with your brain, not against it.
            Built for neurodivergent minds who need different approaches to productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-4">
                Get Started
              </Button>
            </Link>
            <Link href="/neuro-check">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary-900 mb-12">
            Coming Soon: Phase by Phase
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Phase 1 */}
            <Card variant="elevated" className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-100 text-primary-600 text-sm font-semibold px-2 py-1 rounded-full">
                    Phase 1
                  </span>
                </div>
                <CardTitle>Core Task Dashboard</CardTitle>
                <CardDescription>
                  Capture thoughts, triage tasks, focus on today, and monitor your energy load
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-secondary-600">
                  <li>• Brain dump capture system</li>
                  <li>• Priority-based task triage</li>
                  <li>• Today&apos;s focus view</li>
                  <li>• Energy load monitoring</li>
                </ul>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card variant="elevated" className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-100 text-green-600 text-sm font-semibold px-2 py-1 rounded-full">
                    Phase 2 - Partial
                  </span>
                </div>
                <CardTitle>Neuro-Check & Energy Units</CardTitle>
                <CardDescription>
                  Track your mental state and manage energy like the finite resource it is
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-secondary-600">
                  <li>✅ Dynamic Capacity System</li>
                  <li>✅ Daily neuro-check widget</li>
                  <li>✅ Brain mode & burnout tracking</li>
                  <li>• Spoon theory integration (in progress)</li>
                </ul>
                <div className="mt-4">
                  <Link href="/auth">
                    <Button size="sm" className="w-full">
                      Try Neuro-Check
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card variant="outlined" className="h-full opacity-75">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-secondary-100 text-secondary-600 text-sm font-semibold px-2 py-1 rounded-full">
                    Phase 3
                  </span>
                </div>
                <CardTitle>Life Management Tools</CardTitle>
                <CardDescription>
                  Maker-blocks, life-care tasks, movement breaks, and overload protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-secondary-600">
                  <li>• Deep work time blocks</li>
                  <li>• Self-care reminders</li>
                  <li>• Movement integration</li>
                  <li>• Overload mode support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
              <CardContent className="py-8">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">
                  🚀 Phase 1 Complete - Phase 2 In Progress
                </h3>
                <p className="text-primary-700 mb-6">
                  We&apos;re building this app phase by phase, with careful attention to accessibility 
                  and neurodivergent needs. Phase 1 (Core Task Dashboard) is complete, and Phase 2 (Neuro-Check) is now partially available!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    ✓ Phase 0: Bootstrap
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    ✓ Phase 1: Core Dashboard
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    🔄 Phase 2: Neuro-Check (Partial)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
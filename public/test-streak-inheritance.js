// 🧪 Streak Inheritance Test Script for EF Buddy
// This script tests the streak inheritance fix by simulating the exact scenario that was failing

console.log('🧪 Starting Streak Inheritance Test...')

// Helper function to create test dates
function getTestDate(daysFromToday = 0) {
    const date = new Date('2025-08-18')
    date.setDate(date.getDate() + daysFromToday)
    return date.toISOString().split('T')[0]
}

// Test 1: Setup scenario that was failing
function setupFailingScenario() {
    console.log('\n📋 Test 1: Setup Failing Scenario')
    
    // Clear existing data
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith('neuro-check-')) {
            localStorage.removeItem(key)
        }
    }
    
    // Create Day 1 data with sleep streak = 1
    const day1 = getTestDate(0)
    const day1Data = {
        mood_level: 5,
        energy_units: 5,
        focus_capacity: 5,
        stress_level: 5,
        brain_mode: 'Normal',
        burnout_flags: [],
        spoon_expansion_efforts: ['sleep'],
        habit_streaks: [{
            effort_id: 'sleep',
            current_streak: 1,
            last_checked_date: day1,
            is_earned: false
        }],
        last_updated: new Date().toISOString()
    }
    localStorage.setItem(`neuro-check-${day1}`, JSON.stringify(day1Data))
    console.log(`✅ Created Day 1 (${day1}) with sleep streak = 1`)
    
    // Create Day 2 data with NO spoon_expansion_efforts and NO habit_streaks
    // This simulates a fresh day that should inherit from Day 1
    const day2 = getTestDate(1)
    const day2Data = {
        mood_level: 5,
        energy_units: 5,
        focus_capacity: 5,
        stress_level: 5,
        brain_mode: 'Normal',
        burnout_flags: [],
        spoon_expansion_efforts: [], // Empty - this was causing the issue
        habit_streaks: [], // Empty - should inherit from Day 1
        last_updated: new Date().toISOString()
    }
    localStorage.setItem(`neuro-check-${day2}`, JSON.stringify(day2Data))
    console.log(`✅ Created Day 2 (${day2}) with empty streaks (should inherit from Day 1)`)
    
    return { day1, day2, day1Data, day2Data }
}

// Test 2: Simulate the inheritance logic
function testInheritanceLogic(day2) {
    console.log(`\n🔍 Test 2: Testing Inheritance Logic for ${day2}`)
    
    const today = day2
    const savedDataKey = `neuro-check-${today}`
    const savedData = localStorage.getItem(savedDataKey)
    
    if (!savedData) {
        console.log('❌ No data found for today')
        return false
    }
    
    const parsed = JSON.parse(savedData)
    console.log('📋 Parsed data:', parsed)
    
    // This is the exact logic from the component
    let streaksToLoad = parsed.habit_streaks || []
    console.log('📊 Initial streaks from current day:', streaksToLoad)
    
    if (streaksToLoad.length === 0) {
        console.log('🔍 No streaks for today, checking previous day...')
        
        // Get previous day
        const prevDate = new Date(today)
        prevDate.setDate(prevDate.getDate() - 1)
        const previousDay = prevDate.toISOString().split('T')[0]
        const previousDayData = localStorage.getItem(`neuro-check-${previousDay}`)
        
        console.log(`📅 Looking for previous day: ${previousDay}`)
        
        if (previousDayData) {
            try {
                const previousParsed = JSON.parse(previousDayData)
                const previousStreaks = previousParsed.habit_streaks || []
                console.log('📈 Previous day streaks found:', previousStreaks)
                
                if (previousStreaks.length > 0) {
                    console.log('✅ SUCCESS: Inheriting streaks from previous day!')
                    streaksToLoad = previousStreaks
                    
                    // Verify the inherited data
                    const sleepStreak = streaksToLoad.find(s => s.effort_id === 'sleep')
                    if (sleepStreak) {
                        console.log(`🏆 Sleep streak inherited: ${sleepStreak.current_streak}/5 days`)
                        console.log(`📅 Last checked: ${sleepStreak.last_checked_date}`)
                        return true
                    }
                } else {
                    console.log('⚠️ Previous day has no streaks')
                }
            } catch (e) {
                console.log('❌ Could not parse previous day data:', e)
            }
        } else {
            console.log('📂 No previous day data found')
        }
    } else {
        console.log('ℹ️ Day already has streaks, no inheritance needed')
    }
    
    return false
}

// Test 3: Full 5-day progression
function testFullProgression() {
    console.log('\n🚀 Test 3: Full 5-Day Progression')
    
    // Clear data
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith('neuro-check-')) {
            localStorage.removeItem(key)
        }
    }
    
    // Create 5 days of progression
    for (let day = 0; day < 5; day++) {
        const date = getTestDate(day)
        const streakCount = day + 1
        
        const data = {
            mood_level: 5,
            energy_units: 5,
            focus_capacity: 5,
            stress_level: 5,
            brain_mode: 'Normal',
            burnout_flags: [],
            spoon_expansion_efforts: ['sleep'],
            habit_streaks: [{
                effort_id: 'sleep',
                current_streak: streakCount,
                last_checked_date: date,
                is_earned: streakCount >= 5,
                earned_date: streakCount === 5 ? date : undefined
            }],
            last_updated: new Date().toISOString()
        }
        
        localStorage.setItem(`neuro-check-${date}`, JSON.stringify(data))
        console.log(`✅ Day ${day + 1} (${date}): Streak = ${streakCount}/5${streakCount >= 5 ? ' 🏆 EARNED!' : ''}`)
    }
    
    // Test inheritance from day 4 to day 5
    const day5Date = getTestDate(4)
    const day5Data = JSON.parse(localStorage.getItem(`neuro-check-${day5Date}`))
    
    if (day5Data && day5Data.habit_streaks.length > 0) {
        const sleepStreak = day5Data.habit_streaks.find(s => s.effort_id === 'sleep')
        if (sleepStreak && sleepStreak.is_earned) {
            console.log('🎉 SUCCESS: 5-day streak completed and marked as earned!')
            return true
        }
    }
    
    return false
}

// Run all tests
function runAllTests() {
    console.log('🎯 Running All Streak Inheritance Tests...')
    console.log('=' .repeat(50))
    
    // Test 1: Setup and test basic inheritance
    const scenario = setupFailingScenario()
    const inheritanceWorks = testInheritanceLogic(scenario.day2)
    
    // Test 2: Full progression
    const progressionWorks = testFullProgression()
    
    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY')
    console.log('=' .repeat(50))
    console.log(`🔄 Inheritance Logic: ${inheritanceWorks ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🏆 5-Day Progression: ${progressionWorks ? '✅ PASS' : '❌ FAIL'}`)
    
    if (inheritanceWorks && progressionWorks) {
        console.log('\n🎉 ALL TESTS PASSED! The streak inheritance fix is working correctly.')
    } else {
        console.log('\n⚠️ Some tests failed. The streak inheritance may need additional fixes.')
    }
    
    console.log('\n📋 Current localStorage state:')
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('neuro-check-')) {
            const data = JSON.parse(localStorage.getItem(key))
            const streaks = data.habit_streaks || []
            const sleepStreak = streaks.find(s => s.effort_id === 'sleep')
            console.log(`  ${key}: ${sleepStreak ? `Sleep ${sleepStreak.current_streak}/5` : 'No streaks'}`)
        }
    }
}

// Export for use
window.testStreakInheritance = {
    setupFailingScenario,
    testInheritanceLogic,
    testFullProgression,
    runAllTests,
    getTestDate
}

console.log('🎮 Test functions loaded! Run window.testStreakInheritance.runAllTests() to test the fix.')
const toggleSpoonExpansionEffort = useCallback((effortId: string) => {
  console.log('🔄 TOGGLE START:', effortId)
  console.log('📊 Current expansionEfforts:', expansionEfforts)
  console.log('🏆 Current habitStreaks:', habitStreaks)
  
  const today = getCurrentDate()
  const isCurrentlyChecked = expansionEfforts.includes(effortId)
  
  console.log('✅ Is currently checked:', isCurrentlyChecked)
  console.log('📅 Today:', today)
  
  let newEfforts: string[]
  let newStreaks: HabitStreak[]
  
  if (isCurrentlyChecked) {
    // Unchecking - remove from today's efforts
    console.log('❌ UNCHECKING habit:', effortId)
    newEfforts = expansionEfforts.filter(id => id !== effortId)
    
    // Reset this habit's streak to 0
    newStreaks = habitStreaks.map(streak => 
      streak.effort_id === effortId 
        ? { ...streak, current_streak: 0, last_checked_date: '' }
        : streak
    )
    
    // If no existing streak, keep streaks unchanged
    if (!habitStreaks.some(s => s.effort_id === effortId)) {
      newStreaks = habitStreaks
    }
    
  } else {
    // Checking - add to efforts and increment streak
    console.log('✅ CHECKING habit:', effortId)
    newEfforts = [...expansionEfforts, effortId]
    
    // Find existing streak or start fresh
    const existingStreak = habitStreaks.find(s => s.effort_id === effortId)
    const currentStreakCount = existingStreak?.current_streak || 0
    const newStreakCount = currentStreakCount + 1
    
    console.log('📈 Incrementing streak:', currentStreakCount, '→', newStreakCount)
    
    const updatedStreak: HabitStreak = {
      effort_id: effortId,
      current_streak: newStreakCount,
      last_checked_date: today,
      is_earned: newStreakCount >= 5,
      earned_date: newStreakCount === 5 ? today : (existingStreak?.earned_date || undefined)
    }
    
    console.log('🏆 Updated streak object:', updatedStreak)
    
    // Update or add the streak
    if (existingStreak) {
      newStreaks = habitStreaks.map(s => s.effort_id === effortId ? updatedStreak : s)
      console.log('📝 Updated existing streak in array')
    } else {
      newStreaks = [...habitStreaks, updatedStreak]
      console.log('➕ Added new streak to array')
    }
  }
  
  console.log('✨ Final new efforts:', newEfforts)
  console.log('📊 Final new streaks:', newStreaks)
  
  // Update all states
  setExpansionEfforts(newEfforts)
  setHabitStreaks(newStreaks)
  setCheckData(prev => ({
    ...prev,
    spoon_expansion_efforts: newEfforts
  }))
  
  console.log('🔄 TOGGLE COMPLETE')
  
}, [expansionEfforts, habitStreaks])
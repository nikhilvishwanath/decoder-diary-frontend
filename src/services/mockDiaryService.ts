// Mock diary service for testing without backend
export interface DiaryEntryPublic {
  id: string
  title: string
  content: string
  mood?: string
  tags?: string
  created_at: string
  updated_at: string
  owner_id: string
}

export interface DiaryEntryCreate {
  title: string
  content: string
  mood?: string
  tags?: string
}

export interface DiaryEntryUpdate {
  title?: string
  content?: string
  mood?: string
  tags?: string
}

export interface DiaryEntriesPublic {
  data: DiaryEntryPublic[]
  count: number
}

// Mock data
const mockEntries: DiaryEntryPublic[] = [
  {
    id: "1",
    title: "My First Diary Entry",
    content: "Today was a great day! I'm excited to start writing in my digital diary. This is a test entry to see how everything works.",
    mood: "happy",
    tags: "first-entry,excited,test",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    owner_id: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "2",
    title: "Reflection on Learning",
    content: "I've been learning a lot about web development lately. FastAPI and React make a great combination for building full-stack applications. The authentication system is working well.",
    mood: "thoughtful",
    tags: "learning,development,programming",
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    owner_id: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "3",
    title: "Today's Accomplishments",
    content: "I successfully set up the diary application with user authentication. The mock system is working perfectly, and I can now test the frontend without needing the backend running.",
    mood: "accomplished",
    tags: "achievement,progress,testing",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: "550e8400-e29b-41d4-a716-446655440000",
  },
]

class MockDiaryService {
  private entries: DiaryEntryPublic[] = [...mockEntries]
  private nextId = 4

  async readDiaryEntries(
    skip: number = 0,
    limit: number = 100,
    search?: string,
    mood?: string,
    tags?: string
  ): Promise<DiaryEntriesPublic> {
    let filteredEntries = [...this.entries]

    // Apply search filter
    if (search) {
      filteredEntries = filteredEntries.filter(
        entry =>
          entry.title.toLowerCase().includes(search.toLowerCase()) ||
          entry.content.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply mood filter
    if (mood) {
      filteredEntries = filteredEntries.filter(entry => entry.mood === mood)
    }

    // Apply tags filter
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim().toLowerCase())
      filteredEntries = filteredEntries.filter(entry =>
        entry.tags && tagList.some(tag => entry.tags!.toLowerCase().includes(tag))
      )
    }

    // Sort by created_at descending (newest first)
    filteredEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply pagination
    const paginatedEntries = filteredEntries.slice(skip, skip + limit)

    return {
      data: paginatedEntries,
      count: filteredEntries.length,
    }
  }

  async readDiaryEntry(id: string): Promise<DiaryEntryPublic> {
    const entry = this.entries.find(e => e.id === id)
    if (!entry) {
      throw new Error("Diary entry not found")
    }
    return entry
  }

  async createDiaryEntry(entryData: DiaryEntryCreate): Promise<DiaryEntryPublic> {
    const newEntry: DiaryEntryPublic = {
      id: this.nextId.toString(),
      ...entryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
    }
    
    this.entries.push(newEntry)
    this.nextId++
    
    return newEntry
  }

  async updateDiaryEntry(id: string, entryData: DiaryEntryUpdate): Promise<DiaryEntryPublic> {
    const entryIndex = this.entries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      throw new Error("Diary entry not found")
    }

    const updatedEntry = {
      ...this.entries[entryIndex],
      ...entryData,
      updated_at: new Date().toISOString(),
    }

    this.entries[entryIndex] = updatedEntry
    return updatedEntry
  }

  async deleteDiaryEntry(id: string): Promise<{ message: string }> {
    const entryIndex = this.entries.findIndex(e => e.id === id)
    if (entryIndex === -1) {
      throw new Error("Diary entry not found")
    }

    this.entries.splice(entryIndex, 1)
    return { message: "Diary entry deleted successfully" }
  }

  async getDiaryStats(): Promise<{
    total_entries: number
    recent_entries_30_days: number
    mood_distribution: Record<string, number>
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentEntries = this.entries.filter(
      entry => new Date(entry.created_at) >= thirtyDaysAgo
    )

    const moodDistribution: Record<string, number> = {}
    this.entries.forEach(entry => {
      if (entry.mood) {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1
      }
    })

    return {
      total_entries: this.entries.length,
      recent_entries_30_days: recentEntries.length,
      mood_distribution: moodDistribution,
    }
  }
}

// Export singleton instance
export const mockDiaryService = new MockDiaryService()

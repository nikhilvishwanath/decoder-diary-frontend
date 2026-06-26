import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
  Input,
  Textarea,
  Badge,
} from "@chakra-ui/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { FiPlus, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi"
import { useForm } from "react-hook-form"

import {
  DiaryService,
  type DiaryEntryPublic,
  type DiaryEntryCreate,
  type DiaryEntryUpdate,
} from "@/client"

export const Route = createFileRoute("/_layout/diary")({
  component: DiaryEntries,
})

function DiaryEntries() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntryPublic | null>(null)

  const queryClient = useQueryClient()

  // Fetch diary entries
  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["diaryEntries", searchTerm, selectedMood],
    queryFn: () =>
      DiaryService.readDiaryEntries({
        skip: 0,
        limit: 100,
        search: searchTerm || undefined,
        mood: selectedMood || undefined,
      }),
  })

  // Create entry mutation
  const createMutation = useMutation({
    mutationFn: (data: DiaryEntryCreate) => DiaryService.createDiaryEntry({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] })
      setShowCreateForm(false)
      reset()
    },
  })

  // Update entry mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiaryEntryUpdate }) =>
      DiaryService.updateDiaryEntry({ id, requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] })
      setEditingEntry(null)
      editReset()
    },
  })

  // Delete entry mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => DiaryService.deleteDiaryEntry({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiaryEntryCreate>()

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    setValue: editSetValue,
  } = useForm<DiaryEntryUpdate>()

  const onSubmit = (data: DiaryEntryCreate) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data: DiaryEntryUpdate) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data })
    }
  }

  const handleEdit = (entry: DiaryEntryPublic) => {
    setEditingEntry(entry)
    editSetValue("title", entry.title)
    editSetValue("content", entry.content)
    editSetValue("mood", entry.mood || "")
    editSetValue("tags", entry.tags || "")
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this diary entry?")) {
      deleteMutation.mutate(id)
    }
  }

  const formatDate = (dateString: string) => {
    // Parse the date and display it in user's local timezone
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short", // This will show the timezone
    });
  }

  const moods = ["happy", "sad", "excited", "thoughtful", "accomplished", "grateful", "anxious", "calm"]

  return (
    <Container maxW="4xl" py={8}>
      <Stack gap={6}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">My Diary</Heading>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
          >
            <FiPlus style={{ marginRight: '8px' }} />
            New Entry
          </Button>
        </Flex>

        {/* Filters */}
        <Stack direction="row" gap={4}>
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Box>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "150px" }}
            >
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </Box>
        </Stack>

        {/* Create Form */}
        {showCreateForm && (
          <Box p={6} border="1px solid #e2e8f0" borderRadius="md" bg="gray.50">
            <Heading size="md" mb={4}>New Diary Entry</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={4}>
                <Box>
                  <Text mb={2}>Title</Text>
                  <Input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter a title for your entry"
                    bg="white"
                  />
                  {errors.title && (
                    <Text color="red.500" fontSize="sm">
                      {errors.title.message}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2}>Content</Text>
                  <Textarea
                    {...register("content", { required: "Content is required" })}
                    placeholder="Write your thoughts..."
                    rows={6}
                    bg="white"
                  />
                  {errors.content && (
                    <Text color="red.500" fontSize="sm">
                      {errors.content.message}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2}>Mood (optional)</Text>
                  <select
                    {...register("mood")}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "white" }}
                  >
                    <option value="">Select a mood</option>
                    {moods.map(mood => (
                      <option key={mood} value={mood}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text mb={2}>Tags (optional)</Text>
                  <Input
                    {...register("tags")}
                    placeholder="Enter tags separated by commas"
                    bg="white"
                  />
                </Box>

                <Stack direction="row" justify="end" gap={2}>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="blue.500"
                    color="white"
                    _hover={{ bg: "blue.600" }}
                    loading={createMutation.isPending}
                  >
                    Save Entry
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        )}

        {/* Edit Form */}
        {editingEntry && (
          <Box p={6} border="1px solid #e2e8f0" borderRadius="md" bg="yellow.50">
            <Heading size="md" mb={4}>Edit Diary Entry</Heading>
            <form onSubmit={editHandleSubmit(onEditSubmit)}>
              <Stack gap={4}>
                <Box>
                  <Text mb={2}>Title</Text>
                  <Input
                    {...editRegister("title")}
                    placeholder="Enter a title for your entry"
                    bg="white"
                  />
                </Box>

                <Box>
                  <Text mb={2}>Content</Text>
                  <Textarea
                    {...editRegister("content")}
                    placeholder="Write your thoughts..."
                    rows={6}
                    bg="white"
                  />
                </Box>

                <Box>
                  <Text mb={2}>Mood (optional)</Text>
                  <select
                    {...editRegister("mood")}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "white" }}
                  >
                    <option value="">Select a mood</option>
                    {moods.map(mood => (
                      <option key={mood} value={mood}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text mb={2}>Tags (optional)</Text>
                  <Input
                    {...editRegister("tags")}
                    placeholder="Enter tags separated by commas"
                    bg="white"
                  />
                </Box>

                <Stack direction="row" justify="end" gap={2}>
                  <Button variant="outline" onClick={() => setEditingEntry(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="blue.500"
                    color="white"
                    _hover={{ bg: "blue.600" }}
                    loading={updateMutation.isPending}
                  >
                    Update Entry
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        )}

        {/* Entries List */}
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <Stack gap={4}>
            {entriesData?.data.map((entry) => (
              <Box key={entry.id} p={6} border="1px solid #e2e8f0" borderRadius="md" bg="white">
                <Flex justify="space-between" align="start" mb={4}>
                  <Stack gap={1}>
                    <Heading size="md">{entry.title}</Heading>
                    <Stack direction="row" align="center" gap={2}>
                      <Text fontSize="sm" color="gray.500">
                        <FiCalendar style={{ display: "inline", marginRight: "4px" }} />
                        {formatDate(entry.created_at)}
                      </Text>
                      {entry.mood && (
                        <Badge bg="purple.100" color="purple.800">{entry.mood}</Badge>
                      )}
                    </Stack>
                  </Stack>
                  <Stack direction="row" gap={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(entry)}
                    >
                      <FiEdit style={{ marginRight: '4px' }} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="red.500"
                      _hover={{ bg: "red.50" }}
                      onClick={() => handleDelete(entry.id)}
                    >
                      <FiTrash2 style={{ marginRight: '4px' }} />
                      Delete
                    </Button>
                  </Stack>
                </Flex>
                
                <Text mb={4}>{entry.content}</Text>
                
                {(entry.tags || entry.ai_tags) && (
                  <Stack direction="row" wrap="wrap" gap={2} mb={4}>
                    {entry.tags && entry.tags.split(",").map((tag) => (
                      <Box key={`${entry.id}-${tag.trim()}`} px={2} py={1} bg="blue.100" color="blue.800" borderRadius="md" fontSize="sm">
                        {tag.trim()}
                      </Box>
                    ))}
                    {entry.ai_tags && entry.ai_tags.split(",").map((tag) => (
                      <Box key={`${entry.id}-ai-${tag.trim()}`} px={2} py={1} bg="purple.100" color="purple.800" borderRadius="md" fontSize="sm">
                        <Text as="span" mr={1}>🤖</Text>
                        {tag.trim()}
                      </Box>
                    ))}
                  </Stack>
                )}
                
                {entry.ai_summary && (
                  <Box p={4} bg="blue.50" borderLeft="4px solid" borderLeftColor="blue.500" borderRadius="md" fontStyle="italic">
                    <Text fontSize="sm" fontWeight="bold" color="blue.800" mb={2}>
                      ✨ AI Reflection
                    </Text>
                    <Text fontSize="sm" color="blue.700" lineHeight="1.6" fontStyle="italic">
                      {entry.ai_summary}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
            {(!entriesData?.data || entriesData.data.length === 0) && (
              <Text textAlign="center" color="gray.500" py={8}>
                No diary entries found. Start writing your first entry!
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

export default DiaryEntries

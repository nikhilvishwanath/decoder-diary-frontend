import {
  Container,
  Flex,
  Heading,
  VStack,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Button,
  Stack,
  Input,
} from "@chakra-ui/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FiEdit, FiTrash2, FiTarget, FiFilter } from "react-icons/fi"
import { z } from "zod"
import { useState } from "react"

import { type ItemPublic } from "@/client"
import GoalsService from "@/client/goals"
import type { ApiError } from "@/client/core/ApiError"
import AddGoal, { GOAL_TYPES } from "@/components/Goals/AddGoal"
import EditGoal from "@/components/Goals/EditGoal"
import PendingGoals from "@/components/Pending/PendingGoals"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { parseGoalData } from "@/utils/goalUtils"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"

const PER_PAGE = 10

export const goalsSearchSchema = z.object({
  page: z.coerce.number().positive().catch(1),
})

export const Route = createFileRoute("/_layout/goals")({
  component: Goals,
  validateSearch: goalsSearchSchema,
})

// Chakra UI color mapping for consistency
function mapColorToDynamicColor(colorName: string) {
  const colorMap: Record<string, string> = {
    red: "red.500",
    green: "green.500", 
    blue: "blue.500",
    yellow: "yellow.500",
    purple: "purple.500",
    orange: "orange.500",
    pink: "pink.500",
    teal: "teal.500",
    cyan: "cyan.500",
    gray: "gray.500",
    indigo: "indigo.500",
    lime: "lime.500",
  }
  
  return colorMap[colorName] || colorMap.gray
}

function getGoalsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      GoalsService.getGoals({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["goals", { page }],
  }
}

function GoalsGrid({ setEditingGoal }: { 
  setEditingGoal: (goal: ItemPublic | null) => void; 
}) {
  const { page } = Route.useSearch()
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [selectedGoalType, setSelectedGoalType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const { data, isLoading } = useQuery({
    ...getGoalsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => GoalsService.deleteGoal(id),
    onSuccess: () => {
      showSuccessToast("Goal deleted successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const handleDelete = (goal: ItemPublic) => {
    if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
      deleteMutation.mutate(goal.id)
    }
  }

  const handleEdit = (goal: ItemPublic) => {
    setEditingGoal(goal)
  }

  const goals = data?.data.slice(0, PER_PAGE) ?? []

  // Filter goals based on search term and goal type
  const filteredGoals = goals.filter((goal) => {
    const parsedGoal = parseGoalData(goal.description)
    const matchesSearch = searchTerm === "" || 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parsedGoal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedGoalType === "" || parsedGoal.goalType === selectedGoalType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return <PendingGoals />
  }

  if (filteredGoals.length === 0 && (searchTerm || selectedGoalType)) {
    return (
      <VStack gap={6}>
        {/* Filter Controls */}
        <Stack direction={{ base: "column", md: "row" }} gap={4} w="full" align="center">
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <select
            value={selectedGoalType}
            onChange={(e) => setSelectedGoalType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              backgroundColor: "white",
              minWidth: "200px",
            }}
          >
            <option value="">All Goal Types</option>
            {GOAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.emoji} {type.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedGoalType("")
            }}
          >
            <FiFilter style={{ marginRight: '4px' }} />
            Clear Filters
          </Button>
        </Stack>

        {/* Empty State */}
        <VStack textAlign="center" gap={4} py={8}>
          <FiTarget size={64} color="gray" />
          <VStack gap={2}>
            <Heading size="md" color="gray.600">No goals found</Heading>
            <Text color="gray.500">No goals match your current filters.</Text>
            <Text fontSize="sm" color="gray.500">
              Try adjusting your search terms or clearing filters.
            </Text>
          </VStack>
        </VStack>
      </VStack>
    )
  }

  if (filteredGoals.length === 0) {
    return (
      <VStack textAlign="center" gap={4} py={8}>
        <FiTarget size={64} color="gray" />
        <VStack gap={2}>
          <Heading size="md" color="gray.600">No goals yet</Heading>
          <Text color="gray.500">Start tracking your goals by creating your first one.</Text>
          <Text fontSize="sm" color="gray.500">
            Goals help you stay focused and motivated towards achieving your aspirations.
          </Text>
        </VStack>
      </VStack>
    )
  }

  return (
    <>
      {/* Filter Controls */}
      <Stack direction={{ base: "column", md: "row" }} gap={4} mb={6} align="center">
        <Input
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <select
          value={selectedGoalType}
          onChange={(e) => setSelectedGoalType(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            backgroundColor: "white",
            minWidth: "200px",
          }}
        >
          <option value="">All Goal Types</option>
          {GOAL_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.emoji} {type.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("")
            setSelectedGoalType("")
          }}
        >
          <FiFilter style={{ marginRight: '4px' }} />
          Clear Filters
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {filteredGoals.map((goal) => {
          const parsedGoal = parseGoalData(goal.description)
          const goalTypeConfig = GOAL_TYPES.find(type => type.value === parsedGoal.goalType)
          
          return (
            <Card.Root
              key={goal.id}
              variant="outline"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                transition: "all 0.2s",
              }}
            >
              <Card.Header pb={2}>
                <Flex justify="space-between" align="flex-start" gap={2}>
                  <Heading size="sm" mb={2} lineHeight="1.3" flex="1">
                    {goal.title}
                  </Heading>
                  <Flex gap={1}>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => handleEdit(goal)}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => handleDelete(goal)}
                      loading={deleteMutation.isPending}
                    >
                      <FiTrash2 />
                    </Button>
                  </Flex>
                </Flex>
              </Card.Header>
              <Card.Body pt={0}>
                <Text 
                  color="gray.600" 
                  fontSize="sm"
                  lineHeight="1.4"
                  mb={4}
                  minH="40px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {parsedGoal.description || "No description"}
                </Text>
                
                {goalTypeConfig && (
                  <Badge
                    bg={mapColorToDynamicColor(goalTypeConfig.color)}
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                  >
                    {goalTypeConfig.emoji} {goalTypeConfig.label}
                  </Badge>
                )}
              </Card.Body>
            </Card.Root>
          )
        })}
      </SimpleGrid>

      <Flex
        mt={4}
        pt={4}
        borderTop="1px solid"
        borderColor="gray.200"
        justifyContent="space-between"
      >
        <Text fontSize="sm" color="gray.600">
          Showing {filteredGoals.length} of {goals.length} goals
        </Text>
        <PaginationRoot
          page={page}
          count={data?.count || 0}
          pageSize={PER_PAGE}
          variant="solid"
          size="sm"
        >
          <Flex gap={1} align="center">
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Goals() {
  const [editingGoal, setEditingGoal] = useState<ItemPublic | null>(null)

  return (
    <Container maxW="full">
      <Flex justify="space-between" align="center" pt={12} mb={6}>
        <Heading size="lg" color="gray.800">
          My Goals
        </Heading>
        <AddGoal />
      </Flex>
      <GoalsGrid setEditingGoal={setEditingGoal} />
      <EditGoal 
        isOpen={!!editingGoal} 
        onClose={() => setEditingGoal(null)} 
        goal={editingGoal} 
      />
    </Container>
  )
}

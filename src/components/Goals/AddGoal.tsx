import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"

import { type ItemCreate } from "@/client"
import GoalsService from "@/client/goals"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

// Define goal types with their colors and emojis
export const GOAL_TYPES = [
  { value: "short-term", label: "Short Term", color: "green", emoji: "⚡" },
  { value: "long-term", label: "Long Term", color: "blue", emoji: "🎯" },
  { value: "habit", label: "Habit", color: "purple", emoji: "🔄" },
  { value: "daily", label: "Daily", color: "orange", emoji: "📅" },
  { value: "weekly", label: "Weekly", color: "teal", emoji: "📊" },
  { value: "monthly", label: "Monthly", color: "cyan", emoji: "🗓️" },
  { value: "yearly", label: "Yearly", color: "pink", emoji: "📈" },
  { value: "personal", label: "Personal", color: "red", emoji: "🌟" },
  { value: "career", label: "Career", color: "yellow", emoji: "💼" },
  { value: "health", label: "Health", color: "green", emoji: "💪" },
  { value: "financial", label: "Financial", color: "gray", emoji: "💰" },
  { value: "learning", label: "Learning", color: "indigo", emoji: "📚" },
] as const

interface GoalFormData {
  title: string
  description: string
  goalType: string
}

const AddGoal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<GoalFormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      description: "",
      goalType: "short-term",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ItemCreate) =>
      GoalsService.createGoal(data),
    onSuccess: () => {
      showSuccessToast("Goal created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    // Combine goal type and description with a separator
    const combinedDescription = `[GOAL_TYPE:${data.goalType}]${data.description || ""}`
    
    const itemData: ItemCreate = {
      title: data.title,
      description: combinedDescription,
    }
    
    mutation.mutate(itemData)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-goal">
          <FaPlus fontSize="16px" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new goal.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.title}
                errorText={errors.title?.message}
                label="Title"
              >
                <Input
                  id="title"
                  {...register("title", {
                    required: "Title is required.",
                  })}
                  placeholder="Goal title"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.goalType}
                errorText={errors.goalType?.message}
                label="Goal Type"
              >
                <select
                  {...register("goalType", {
                    required: "Goal type is required.",
                  })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  {GOAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description (Optional)"
              >
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Goal description"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddGoal

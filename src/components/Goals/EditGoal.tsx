import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useEffect } from "react"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"

import { type ItemCreate, type ItemPublic } from "../../client"
import GoalsService from "../../client/goals"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { parseGoalData } from "../../utils/goalUtils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "../ui/dialog"
import { Field } from "../ui/field"

// Import goal types from AddGoal
import { GOAL_TYPES } from "./AddGoal"

interface GoalFormData {
  title: string
  description: string
  goalType: string
}

interface EditGoalProps {
  isOpen: boolean
  onClose: () => void
  goal: ItemPublic | null
}

const EditGoal = ({ isOpen, onClose, goal }: EditGoalProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Update form when goal changes
  useEffect(() => {
    if (goal) {
      const parsedGoal = parseGoalData(goal.description)
      setValue("title", goal.title)
      setValue("description", parsedGoal.description)
      setValue("goalType", parsedGoal.goalType)
    }
  }, [goal, setValue])

  const mutation = useMutation({
    mutationFn: (data: { id: string; requestBody: ItemCreate }) =>
      GoalsService.updateGoal(data),
    onSuccess: () => {
      showSuccessToast("Goal updated successfully.")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    if (!goal) return
    
    // Combine goal type and description with a separator
    const combinedDescription = `[GOAL_TYPE:${data.goalType}]${data.description || ""}`
    
    const itemData: ItemCreate = {
      title: data.title,
      description: combinedDescription,
    }
    
    mutation.mutate({
      id: goal.id,
      requestBody: itemData,
    })
  }

  if (!goal) return null

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={() => onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update your goal details.</Text>
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
              Update Goal
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditGoal

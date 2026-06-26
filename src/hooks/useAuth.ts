import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import {
  type Body_login_login_access_token as AccessToken,
  type ApiError,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client"
import { handleError } from "@/utils"

// Mock mode configuration - set to false to use real backend
const MOCK_MODE = false

// Hardcoded default user for testing
const MOCK_USER: UserPublic = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  full_name: "Test User",
  is_active: true,
  is_superuser: false,
}

const isLoggedIn = () => {
  if (MOCK_MODE) {
    return localStorage.getItem("mock_logged_in") === "true"
  }
  const token = localStorage.getItem("access_token")
  return token !== null && token.trim() !== ""
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Mock user query for development
  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (MOCK_MODE && isLoggedIn()) {
        return MOCK_USER
      }
      return UsersService.readUserMe()
    },
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) => {
      if (MOCK_MODE) {
        // Mock signup - just resolve successfully
        return Promise.resolve(MOCK_USER)
      }
      return UsersService.registerUser({ requestBody: data })
    },

    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (data: AccessToken) => {
    if (MOCK_MODE) {
      // Mock login - accept any credentials
      localStorage.setItem("mock_logged_in", "true")
      localStorage.setItem("access_token", "mock_token") // For compatibility
      return
    }
    
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const logout = () => {
    if (MOCK_MODE) {
      localStorage.removeItem("mock_logged_in")
    }
    localStorage.removeItem("access_token")
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth

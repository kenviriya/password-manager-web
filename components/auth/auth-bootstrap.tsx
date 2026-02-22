"use client"

import { useEffect, useRef } from "react"
import { getMe } from "@/lib/api/auth"
import { isUnauthorizedError } from "@/lib/errors"
import {
  authBootstrapStarted,
  authSetLoggedOut,
  authSetUser,
} from "@/lib/redux/slices/auth-slice"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"

export function AuthBootstrap() {
  const dispatch = useAppDispatch()
  const initialized = useAppSelector((state) => state.auth.initialized)
  const startedRef = useRef(false)

  useEffect(() => {
    if (initialized || startedRef.current) {
      return
    }

    startedRef.current = true
    dispatch(authBootstrapStarted())

    void getMe()
      .then((response) => {
        dispatch(authSetUser(response.user))
      })
      .catch((error) => {
        if (isUnauthorizedError(error)) {
          dispatch(authSetLoggedOut())
          return
        }

        dispatch(authSetLoggedOut())
      })
  }, [dispatch, initialized])

  return null
}


import axios, { type AxiosError } from "axios"

interface KeycloakErrorResponse {
  error?: string
  error_description?: string
}

const params = {
  client_id: process.env.OIDC_CLIENT_ID,
  client_secret: process.env.OIDC_CLIENT_SECRET,
  grant_type: "refresh_token",
}

// Check for required environment variables
if (!process.env.OIDC_ISSUER) {
  console.error("OIDC_ISSUER environment variable is not set")
}

if (!process.env.OIDC_CLIENT_ID) {
  console.error("OIDC_CLIENT_ID environment variable is not set")
}

if (!process.env.OIDC_CLIENT_SECRET) {
  console.error("OIDC_CLIENT_SECRET environment variable is not set")
}

export const oidc = axios.create({
  baseURL: process.env.OIDC_ISSUER ? `${process.env.OIDC_ISSUER}/protocol/openid-connect` : "",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})

export const refreshTokenRequest = async (refresh_token: string) => {
  if (!process.env.OIDC_ISSUER) {
    console.error("OIDC_ISSUER environment variable is not set")
    throw new Error("OIDC_ISSUER environment variable is not set")
  }

  if (!process.env.OIDC_CLIENT_ID || !process.env.OIDC_CLIENT_SECRET) {
    console.error("OIDC_CLIENT_ID or OIDC_CLIENT_SECRET environment variables are not set")
    throw new Error("OIDC client configuration is missing")
  }

  if (!refresh_token) {
    throw new Error("Refresh token is required")
  }

  try {
    console.log("Attempting to refresh token with issuer:", process.env.OIDC_ISSUER)
    const response = await oidc({
      method: "POST",
      url: "/token",
      data: new URLSearchParams({
        refresh_token,
        ...params,
      }).toString(),
    })

    if (!response.data || !response.data.access_token) {
      console.error("Invalid response format from token refresh:", response.data)
      throw new Error("Invalid response format from token refresh")
    }

    return response
  } catch (error) {
    const axiosError = error as AxiosError<KeycloakErrorResponse>
    console.error("Error refreshing token:", {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      config: {
        url: axiosError.config?.url,
        baseURL: axiosError.config?.baseURL,
      },
    })
    throw {
      status: axiosError.response?.status || 500,
      message: axiosError.response?.data?.error_description || "Error refreshing token",
      details: axiosError.message,
    }
  }
}

export const logoutRequest = async (refresh_token: string) => {
  if (!process.env.OIDC_ISSUER) {
    console.error("OIDC_ISSUER environment variable is not set")
    throw new Error("OIDC_ISSUER environment variable is not set")
  }

  if (!process.env.OIDC_CLIENT_ID || !process.env.OIDC_CLIENT_SECRET) {
    console.error("OIDC_CLIENT_ID or OIDC_CLIENT_SECRET environment variables are not set")
    throw new Error("OIDC client configuration is missing")
  }

  if (!refresh_token) {
    throw new Error("Refresh token is required")
  }

  try {
    console.log("Attempting to logout with issuer:", process.env.OIDC_ISSUER)
    const response = await oidc({
      method: "POST",
      url: "/logout",
      data: new URLSearchParams({
        refresh_token,
        ...params,
      }).toString(),
    })

    return response
  } catch (error) {
    const axiosError = error as AxiosError<KeycloakErrorResponse>
    console.error("Error during logout:", {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      config: {
        url: axiosError.config?.url,
        baseURL: axiosError.config?.baseURL,
      },
    })
    throw {
      status: axiosError.response?.status || 500,
      message: axiosError.response?.data?.error_description || "Error during logout",
      details: axiosError.message,
    }
  }
}

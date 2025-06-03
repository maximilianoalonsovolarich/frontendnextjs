#!/usr/bin/env bash
# ======================================================================
#  get-token.sh
#  - Solicita un access_token a Keycloak (grant_type=password)
#  - Exporta ACCESS_TOKEN y USER_ID en el shell actual
# ======================================================================

# --- Datos de Keycloak -------------------------------------------------
KC_URL="http://localhost:8080"
REALM="dashboard"
CLIENT_ID="dashboard-client"
CLIENT_SECRET="uKpwwWn6kGQlLMvfPSoz8NmMoalEjY9A"
USERNAME="sasha"
PASSWORD="123456"

# --- Solicitar el token ------------------------------------------------
TOKEN_JSON=$(curl -s -X POST \
  "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD")

# --- Extraer y exportar ------------------------------------------------
export ACCESS_TOKEN=$(echo "$TOKEN_JSON" | jq -r '.access_token')

# Sacar el sub (user_id) del JWT
PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d '.' -f2 | tr '_-' '/+')
PAYLOAD=$(printf '%s' "$PAYLOAD" | base64 -d 2>/dev/null)
export USER_ID=$(echo "$PAYLOAD" | jq -r '.sub')

echo "ACCESS_TOKEN y USER_ID exportados en el shell actual."
echo "USER_ID = $USER_ID"


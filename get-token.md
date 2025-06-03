## USO RÁPIDO

export KC_HOST="http://localhost:8080"
export KC_ADMIN="admin"              
export KC_PASS="admin"      
export REALM="dashboard"
export APISIX_CLIENT_ID="apisix-client"
export APISIX_CLIENT_SECRET="VA4vLvu72UQ1fxdIBynRjIH9o8NLEacb"
export REDIRECT_URI="http://localhost:9080/auth/callback"

1.  **Concede permisos y carga el script en tu sesión:**

    ```bash
    chmod +x get-token.sh
    source ./get-token.sh
    ```

2.  **Realiza la búsqueda en tu API Redis Search:**

    a.  **SIN cabecera `Authorization`**

        ```bash
        curl -X POST http://localhost:8000/search \
             -H "Content-Type: application/json" \
             -d '{
                 "user":"'$USER_ID'",
                 "search_index":"find:Account",
                 "search_parameter":"Name",
                 "search_value":"ada",
                 "search_type":"TEXT",
                 "return_values":["Name","ID"]
             }'
        ```

    b.  **CON cabecera `Authorization`**

        ```bash
        curl -X POST http://localhost:8000/search \
             -H "Authorization: Bearer $ACCESS_TOKEN" \
             -H "Content-Type: application/json" \
             -d '{
                 "user":"'$USER_ID'",
                 "search_index":"find:Account",
                 "search_parameter":"Name",
                 "search_value":"ada",
                 "search_type":"TEXT",
                 "return_values":["Name","ID"]
             }'
        ```

3.  **Cambia "ada" por otro término cuando quieras probar con distintos valores.**
    Las variables `ACCESS_TOKEN` y `USER_ID` seguirán en tu shell hasta que lo cierres.

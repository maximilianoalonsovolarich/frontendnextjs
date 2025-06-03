# Guía de Integración de API para Next.js

## Reconstrucción del Contenedor
Para reconstruir completamente el contenedor sin usar caché:
```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```

## Arquitectura de la Aplicación

Esta aplicación Next.js sigue una arquitectura de tres capas para comunicarse con el backend:

1. **Capa de Presentación**: Componentes React que muestran datos y capturan interacciones del usuario (en `/app/*page.tsx`)
2. **Capa de Servicios**: Funciones que gestionan la lógica de negocio y llamadas a la API (en `/lib/api/*`)
3. **Capa de API Routes**: Endpoints del servidor Next.js que actúan como proxy al backend (en `/app/api/*`)

### Flujo de Datos

```
Componente React → Servicio API → API Route de Next.js → Backend → Redis/DB
```

## Estructura de API y Endpoints

La API está estructurada de la siguiente manera:

- **Búsqueda de cuentas**: `POST /api/search/accounts` con formato:
  ```json
  {
    "term": "término_de_búsqueda" 
  }
  ```

- **Detalles de cuenta**: `GET /api/account/{accountId}/details`

## Archivos Clave del Sistema

### 1. Configuración de Autenticación

- **`/lib/auth/auth-options.ts`**: Configura NextAuth.js con Keycloak
  - Define cómo se obtiene y almacena el ID de usuario de Keycloak (`profile.sub`)
  - Configura los callbacks para manejar tokens y sesiones

- **`/app/api/auth/[...nextauth]/route.ts`**: Implementa las rutas de autenticación de NextAuth.js

### 2. Configuración del Cliente API

- **`/lib/http/api-client.ts`**: Define el cliente Axios para llamadas a la API

```typescript
// lib/http/api-client.ts
import axios from "axios"

const apiClient = axios.create({
  // Configuramos la URL base como '/api'
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptores para logging (opcional)
// ...

export default apiClient
```

### 3. Servicios de API

Existen dos implementaciones para los servicios de API de cuentas:

#### Versión 1 (Principal)

- **`/lib/api/accounts/service.ts`**: Implementa las funciones para buscar cuentas y obtener detalles
- **`/lib/api/accounts/types.ts`**: Define las interfaces TypeScript para los objetos de cuenta
- **`/lib/api/accounts/index.ts`**: Exporta las funciones y tipos para uso en la aplicación

#### Versión 2 (Alternativa)

- **`/lib/api/accounts.ts`**: Contiene una implementación alternativa de las mismas funciones

> **IMPORTANTE**: Ambas implementaciones deben mantenerse sincronizadas cuando se realicen cambios.

### 4. Rutas de API en Next.js

- **`/app/api/search/accounts/route.ts`**: Implementa el endpoint POST para búsqueda de cuentas
  - Recibe las solicitudes del frontend
  - Obtiene el ID de usuario de la sesión de Keycloak
  - Envía la solicitud al backend con la estructura correcta

- **`/app/api/account/[accountId]/details/route.ts`**: Implementa el endpoint GET para detalles de cuenta
  - Usa parámetros dinámicos para obtener el ID de la cuenta
  - Reenvia la solicitud al backend con el token de autenticación

### 5. Componentes de UI

- **`/app/search/page.tsx`**: Implementa la página de búsqueda en inglés
- **`/app/buscar/page.tsx`**: Implementa la página de búsqueda en español

## Implementación de Servicios de API

El código para buscar cuentas y obtener detalles está implementado en los siguientes archivos:

```typescript
// Definición de tipos en lib/api/accounts/types.ts o lib/api/accounts.ts

export interface Account {
  id: string
  key?: string
  name: string
}

export interface AccountDetail {
  account: {
    Name: string
    Code: string
    VATNumber: string
    Status: string
    Country: string
    // ... otros campos
  }
  contacts: Array<{
    data: {
      FirstName: string
      LastName: string
      Email: string
      Phone: string
    }
  }>
  addresses: Array<{
    data: {
      Type: string
      Street: string
      City: string
      PostalCode: string
      Country: string
    }
  }>
}

// Busca cuentas usando la API
export const searchAccounts = async (term: string): Promise<Account[]> => {
  try {
    console.log("Searching accounts with term:", term)
    // Usar exactamente la misma ruta que en el ejemplo vanilla JS
    const response = await apiClient.get<Account[]>("/search/accounts", {
      params: { term },
    })
    console.log("Search response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error searching accounts:", error)
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error("Error en la búsqueda de cuentas")
  }
}

// Obtiene detalles de cuenta usando la API
export const getAccountDetails = async (accountId: string): Promise<AccountDetail> => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required')
    }
    console.log(`Getting account details for ID: ${accountId}`)
    
    // Usar exactamente la misma ruta que en el ejemplo vanilla JS
    const response = await apiClient.get<AccountDetail>(`/account/${accountId}/details`)
    
    console.log('Account details response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error in getAccountDetails:', error)
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('Error al obtener detalles de la cuenta')
  }
}

/**
 * Busca cuentas usando la API
 * @param term Término de búsqueda (mínimo 2 caracteres)
 * @returns Promise con array de cuentas que coinciden con el término
 */
export const searchAccounts = async (term: string): Promise<Account[]> => {
  try {
    // Validación del término de búsqueda
    if (!term || term.length < 2) {
      return []
    }

    // Llamada a la API usando POST con el nuevo formato
    const response = await apiClient.post<{ results: Account[], total: number }>("/search/accounts", {
      term // La ruta API se encarga de agregar los demás parámetros
    })

    return response.data.results || []
  } catch (error: unknown) {
    // Manejo de errores
    if (error instanceof AxiosError && error.code === "ECONNREFUSED") {
      throw { error: "API no disponible - Servicio de búsqueda no accesible" }
    }
    
    // Manejo de otros errores
    if (error instanceof AxiosError && error.response) {
      throw { error: error.response.data?.error || "Error en el servidor" }
    } else {
      throw { error: "Error en la búsqueda de cuentas" }
    }
  }
}

/**
 * Obtiene los detalles de una cuenta específica
 * @param accountId ID de la cuenta
 * @returns Promise con los detalles de la cuenta
 */
export const getAccountDetails = async (accountId: string): Promise<AccountDetail> => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required')
    }
    
    // Llamada a la API para obtener detalles
    const response = await apiClient.get<AccountDetail>(`/account/${accountId}/details`)
    
    return response.data
  } catch (error: unknown) {
    // Manejo de errores similar al anterior
    if (error instanceof AxiosError && error.response) {
      throw { error: error.response.data?.error || "Error en el servidor" }
    } else {
      throw { error: "Error al obtener detalles de la cuenta" }
    }
  }
}
```

## Integración con Keycloak: Manejo Automático del ID de Usuario

Un aspecto clave de la implementación es cómo el sistema utiliza **automáticamente** el ID de usuario de Keycloak en todas las solicitudes. Este proceso se realiza en varios pasos:

1. **Autenticación del usuario con Keycloak**:
   - Al iniciar sesión, NextAuth.js almacena el ID único (`sub`) del usuario en la sesión
   - El ID se guarda en `session.user.id` para uso posterior

2. **Captura del ID en las rutas de API**:
   - Cada ruta de API obtiene la sesión con `getServerSession(authOptions)`
   - Extrae el ID del usuario con `session.user.id`
   - Lo incluye automáticamente en la solicitud al backend

3. **Envío del token de autenticación**:
   - Junto con el ID, se envía el token JWT en el encabezado `Authorization`
   - Esto permite al backend verificar la autenticidad de la solicitud

### Implementación de las Rutas de API

#### 1. Ruta para búsqueda de cuentas

```typescript
// app/api/search/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import axios from 'axios';

// Handler para GET /api/search/accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('No session found');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Extraer el término de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams;
    const terminoBusqueda = searchParams.get('term');
    
    if (!terminoBusqueda) {
      console.error('No search term provided');
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      );
    }
    
    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      console.error('BACKEND_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Llamar al backend
    const response = await axios.get(`${apiUrl}/api/search/accounts`, {
      params: { term: terminoBusqueda },
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in search accounts:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message },
      { status: error.response?.status || 500 },
    );
  }
}
\`\`\`

### 2. Ruta para detalles de cuenta

\`\`\`typescript
// app/api/account/[accountId]/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import axios from 'axios';

// Handler for GET /api/account/[accountId]/details
export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { accountId } = params;
    if (!accountId) {
      console.error('No account ID provided');
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      console.error('BACKEND_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Llamar al backend
    const response = await axios.get(`${apiUrl}/api/account/${accountId}/details`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in account details:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message },
      { status: error.response?.status || 500 },
    );
  }
}
```

## Componente de Búsqueda y Visualización

El componente de búsqueda y visualización de detalles debe implementarse de la siguiente manera:

```tsx
// app/search/page.tsx (simplificado)
"use client"
import React, { useState, useEffect, useRef } from "react"
import { searchAccounts, getAccountDetails, type Account, type AccountDetail } from "@/lib/api/accounts"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AccountDetail | null>(null)
  // ... otros estados

  // Efecto para buscar cuentas cuando cambia el término de búsqueda
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        // Buscar cuentas
        try {
          const data = await searchAccounts(searchTerm)
          setResults(data)
        } catch (err) {
          console.error("Search error:", err)
        }
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchTerm])

  // Función para seleccionar una cuenta y cargar sus detalles
  const selectAccount = async (accountId: string, accountName: string) => {
    try {
      const details = await getAccountDetails(accountId)
      setSelectedAccount(details)
    } catch (err) {
      console.error("Error loading details:", err)
    }
  }

  // Renderizado del componente
  return (
    <div>
      {/* Implementación de la interfaz de usuario */}
    </div>
  )
}
\`\`\`

## Puntos Importantes a Considerar

1. **Base URL**: Asegúrate de que el cliente API tenga la base URL configurada como `/api`.

2. **Rutas de API**: Las rutas deben coincidir exactamente con las esperadas:
   - `/search/accounts` para búsqueda
   - `/account/{accountId}/details` para detalles

3. **Estructura de Carpetas**: En Next.js, la estructura de carpetas para las rutas de API debe ser:
   - `app/api/search/accounts/route.ts`
   - `app/api/account/[accountId]/details/route.ts`

4. **Parámetros de Consulta**: Asegúrate de pasar correctamente los parámetros:
   - Para búsqueda: `{ params: { term } }`
   - Para detalles: Usar la ruta dinámica con el ID de la cuenta

5. **Manejo de Errores**: Implementa un manejo de errores adecuado tanto en el cliente como en el servidor.

6. **Autenticación**: Asegúrate de que las solicitudes al backend incluyan los tokens de autenticación necesarios.

## Guía de Integración para Nuevos Endpoints

Si necesitas agregar un nuevo endpoint que interactúe con el backend, sigue estos pasos para mantener la coherencia con la arquitectura actual:

### 1. Definir Tipos

Crea o extiende las interfaces TypeScript en `/lib/api/accounts/types.ts` o en el archivo específico de tu nueva funcionalidad.

### 2. Implementar el Servicio

Crea una función en `/lib/api/accounts/service.ts` (o un nuevo archivo si es para otra entidad) siguiendo el patrón existente:

```typescript
export const myNewFunction = async (param: string): Promise<ResultType> => {
  try {
    // Validaciones
    
    // Llamada a la API
    const response = await apiClient.post<ResultType>('/my-endpoint', {
      // Parámetros específicos
      someParam: param
    })
    
    return response.data
  } catch (error: unknown) {
    // Manejo de errores
  }
}
```

### 3. Crear la Ruta API en Next.js

En `/app/api/my-endpoint/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Obtener sesión y validar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    
    // Extraer datos del cuerpo de la solicitud
    const data = await request.json()
    
    // Llamar al backend con el ID de usuario de Keycloak
    const response = await axios.post(`${process.env.BACKEND_URL}/endpoint`, {
      user: session.user.id, // ID de Keycloak automáticamente incluido
      ...data // Resto de parámetros
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`
      }
    })
    
    return NextResponse.json(response.data)
  } catch (error) {
    // Manejo de errores
  }
}
```

### 4. Usar en Componentes

En tu componente React:

```typescript
import { myNewFunction } from "@/lib/api/my-service"

// En un componente o hook
const handleAction = async () => {
  try {
    const result = await myNewFunction(param)
    // Usar resultado
  } catch (error) {
    // Manejar error
  }
}
```

## Solución de Problemas Comunes

1. **Error 405 (Method Not Allowed)**: Verifica que estés usando el método HTTP correcto (POST para búsquedas, GET para detalles).

2. **Error de Autenticación**: Asegúrate de que el usuario esté autenticado y que la sesión de Keycloak sea válida.

3. **Formato de Solicitud Incorrecto**: Comprueba que la estructura de la solicitud coincida con lo que espera el backend.

4. **Error en Manejo de Respuesta**: Verifica que estés extrayendo correctamente los datos de la respuesta (ej: `response.data.results` para búsquedas).

5. **Inconsistencia entre Implementaciones**: Asegúrate de que tanto `/lib/api/accounts.ts` como `/lib/api/accounts/service.ts` estén sincronizados si modificas la funcionalidad.

## Flujo de Datos Completo

### Para Búsqueda de Cuentas:

1. El usuario escribe en el campo de búsqueda y hace clic en Buscar (o se activa la búsqueda automática).
2. El componente React llama a `searchAccounts(term)`.
3. La función `searchAccounts` envía una solicitud POST a `/api/search/accounts` con el término de búsqueda.
4. La ruta API en Next.js:
   - Obtiene la sesión y extrae el ID de usuario de Keycloak (`session.user.id`)
   - Envía una solicitud POST al backend con el formato requerido, incluyendo el ID de usuario
   - Pasa el token de autenticación en los headers
5. El backend procesa la búsqueda filtrando por el ID de usuario proporcionado.
6. Los resultados se devuelven al frontend y se muestran en la interfaz.

### Para Detalles de Cuenta:

7. El usuario hace clic en una cuenta para ver sus detalles.
8. El componente llama a `getAccountDetails(accountId)`.
9. La función envía una solicitud GET a `/api/account/{accountId}/details`.
10. La ruta API:
    - Extrae el ID de cuenta de la URL
    - Obtiene la sesión y el token de autenticación
    - Envía la solicitud al backend incluyendo el token
11. El backend devuelve los detalles de la cuenta.
12. La interfaz muestra los detalles al usuario.

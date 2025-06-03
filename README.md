docker compose down && docker compose build --no-cache && docker compose up -d

# Aurora Frontend

Aplicación frontend para el sistema Aurora, desarrollada con Next.js y TypeScript.

## Estructura del Proyecto

La aplicación sigue una estructura modular y organizada para facilitar el mantenimiento y la escalabilidad:

\`\`\`
frontend-nextjs/
├── app/                    # Directorio principal de la aplicación Next.js (App Router)
│   ├── api/                # Rutas de API (Next.js API Routes)
│   │   ├── account/        # APIs relacionadas con cuentas específicas
│   │   ├── accounts/       # APIs relacionadas con múltiples cuentas
│   │   ├── auth/           # APIs de autenticación (NextAuth)
│   │   ├── clientes/       # APIs específicas para clientes
│   │   ├── search/         # APIs de búsqueda
│   │   └── system/         # APIs del sistema
│   ├── auth/               # Páginas relacionadas con autenticación
│   ├── buscar/             # Página de búsqueda (versión en español)
│   ├── configuracion/      # Página de configuración (versión en español)
│   ├── perfil/             # Página de perfil (versión en español)
│   ├── profile/            # Página de perfil (versión en inglés)
│   ├── search/             # Página de búsqueda (versión en inglés)
│   ├── settings/           # Página de configuración (versión en inglés)
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal de la aplicación
│   └── page.tsx            # Página principal (Home)
├── components/             # Componentes reutilizables
│   ├── auth/               # Componentes relacionados con autenticación
│   ├── layout/             # Componentes de layout (header, sidebar, etc.)
│   ├── providers/          # Proveedores de contexto
│   └── ui/                 # Componentes de UI (shadcn/ui)
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades y servicios
│   ├── api/                # Servicios de API
│   │   ├── accounts/       # Servicios para cuentas
│   │   │   ├── index.ts    # Exportaciones del módulo
│   │   │   ├── service.ts  # Funciones de servicio
│   │   │   └── types.ts    # Tipos e interfaces
│   │   └── clientes/       # Servicios para clientes
│   ├── auth/               # Utilidades de autenticación
│   ├── http/               # Utilidades HTTP
│   │   ├── api-client.ts   # Cliente HTTP centralizado
│   │   └── error-handler.ts# Manejador de errores HTTP
│   └── utils.ts            # Utilidades generales
├── public/                 # Archivos estáticos
├── styles/                 # Estilos adicionales
├── types/                  # Definiciones de tipos globales
├── .env.local              # Variables de entorno locales
├── Dockerfile              # Configuración de Docker
├── docker-compose.yml      # Configuración de Docker Compose
├── next.config.mjs         # Configuración de Next.js
├── package.json            # Dependencias y scripts
├── tailwind.config.ts      # Configuración de Tailwind CSS
└── tsconfig.json           # Configuración de TypeScript
\`\`\`

## Llamadas a la API

### Estructura de APIs

La aplicación utiliza una estructura de dos capas para las llamadas a la API:

1. **API Routes (Next.js)**: Ubicadas en `app/api/`, actúan como middleware entre el frontend y el backend.
2. **Servicios de API**: Ubicados en `lib/api/`, proporcionan funciones para que los componentes interactúen con las API Routes.

### Flujo de llamadas a la API

\`\`\`
Componente React → Servicio API (lib/api/) → API Route (app/api/) → Backend
\`\`\`

### Servicios de API Principales

#### Cuentas/Clientes

Los servicios para interactuar con cuentas y clientes se encuentran en `lib/api/accounts/`:

\`\`\`typescript
// Importación de servicios
import { searchAccounts, getAccountDetails } from "@/lib/api/accounts";

// Búsqueda de cuentas
const results = await searchAccounts("término de búsqueda");

// Obtener detalles de una cuenta
const accountDetails = await getAccountDetails("account-id");
\`\`\`

### API Routes

#### Búsqueda de Cuentas

- **Ruta**: `/api/search/accounts` o `/api/accounts/search`
- **Método**: GET
- **Parámetros**: `term` (término de búsqueda)
- **Descripción**: Busca cuentas que coincidan con el término de búsqueda
- **Implementación**: `app/api/search/accounts/route.ts`

\`\`\`typescript
// Ejemplo de llamada desde el cliente
const response = await fetch(`/api/search/accounts?term=${searchTerm}`);
const data = await response.json();
\`\`\`

#### Detalles de Cuenta

- **Ruta**: `/api/account/[accountId]/details`
- **Método**: GET
- **Parámetros**: `accountId` (en la ruta)
- **Descripción**: Obtiene los detalles completos de una cuenta específica
- **Implementación**: `app/api/account/[accountId]/details/route.ts`

\`\`\`typescript
// Ejemplo de llamada desde el cliente
const response = await fetch(`/api/account/${accountId}/details`);
const data = await response.json();
\`\`\`

## Autenticación

La aplicación utiliza NextAuth.js con Keycloak como proveedor de autenticación:

- **Configuración**: `lib/auth/auth-options.ts`
- **API Route**: `app/api/auth/[...nextauth]/route.ts`
- **Proveedor**: Keycloak (OIDC)

## Manejo de Errores

El sistema implementa un manejo de errores centralizado:

- **Cliente HTTP**: `lib/http/api-client.ts` - Interceptores para peticiones y respuestas
- **Manejador de Errores**: `lib/http/error-handler.ts` - Función para procesar errores de manera consistente

## Componentes Principales

### Páginas de Búsqueda

- **Español**: `app/buscar/page.tsx`
- **Inglés**: `app/search/page.tsx`

Estas páginas permiten buscar cuentas/clientes y ver sus detalles.

## Variables de Entorno

La aplicación requiere las siguientes variables de entorno:

\`\`\`
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=wIa9NdmgfoNbQ7JpbIycEYDmAQNdq1TKm+0q89wLxeo=

# Keycloak Configuration
OIDC_CLIENT_ID=dashboard-client
OIDC_CLIENT_SECRET=uKpwwWn6kGQlLMvfPSoz8NmMoalEjY9A
OIDC_ISSUER=http://localhost:8080/realms/dashboard

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_URL=http://172.19.0.11:5550

# Frontend Backend URL (para llamadas directas desde el cliente)
NEXT_PUBLIC_BACKEND_URL=http://172.19.0.11:5550
\`\`\`

## Despliegue con Docker

La aplicación está configurada para desplegarse con Docker:

\`\`\`yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: aurora-frontend
    restart: unless-stopped
    network_mode: "host"
    env_file:
      - .env.local
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://0.0.0.0:3000"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

networks:
  shared_network:
    external: true
    name: shared_network
\`\`\`

## Desarrollo

### Requisitos

- Node.js 20+
- pnpm

### Instalación

\`\`\`bash
# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Iniciar en modo producción
pnpm start

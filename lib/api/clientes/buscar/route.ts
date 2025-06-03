import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import axios from 'axios';

// Handler para GET /api/clientes/buscar
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Extraer el término de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams;
    const terminoBusqueda = searchParams.get('q');
    
    if (!terminoBusqueda) {
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      );
    }
    
    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'BACKEND_URL environment variable is not set' },
        { status: 500 }
      );
    }
    const response = await axios.get(`${apiUrl}/clientes/buscar`, {
      params: { q: terminoBusqueda },
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error en la búsqueda de clientes:', error);
    
    return NextResponse.json(
      { error: 'Error en la búsqueda de clientes', detail: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

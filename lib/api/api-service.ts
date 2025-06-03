import axiosInstance from '../axios-config';

export interface Cliente {
  id: number;
  nombre: string;
  contacto: string;
  direccion: string;
  telefono: string;
  email: string;
  tipo: string;
}

// Función para buscar clientes
export const buscarClientes = async (termino: string): Promise<Cliente[]> => {
  try {
    const response = await axiosInstance.get<Cliente[]>('/clientes/buscar', {
      params: { q: termino }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    throw error;
  }
};

// Función para obtener todos los clientes
export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await axiosInstance.get<Cliente[]>('/clientes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

// Función para obtener un cliente por ID
export const obtenerClientePorId = async (id: number): Promise<Cliente> => {
  try {
    const response = await axiosInstance.get<Cliente>(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${id}:`, error);
    throw error;
  }
};

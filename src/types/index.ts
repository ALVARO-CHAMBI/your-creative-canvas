// ==================== AUTH ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  codigo_pais: string;
  telefono: string;
}

export interface VerifyOtpRequest {
  telefono: string;
  codigo: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  rol: 'user' | 'admin';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== COMPONENTES ====================
export type ComponenteNombre = 
  | 'Comprensión Lectora'
  | 'Razonamiento Lógico'
  | 'Conocimientos Generales'
  | 'Habilidades Socioemocionales';

export interface Componente {
  id: string;
  nombre: ComponenteNombre;
  descripcion?: string;
  activo: boolean;
}

// ==================== ARTÍCULOS (Comprensión Lectora) ====================
export interface Articulo {
  id: string;
  componenteId: string;
  titulo: string;
  contenido: string;
  activo: boolean;
  preguntas?: Pregunta[];
}

// ==================== TEMAS ====================
export interface TemaRazonamiento {
  id: string;
  componenteId: string;
  nombre: string;
  activo: boolean;
  subtemas?: SubtemaRazonamiento[];
}

export interface SubtemaRazonamiento {
  id: string;
  temaId: string;
  nombre: string;
  activo: boolean;
  preguntas?: Pregunta[];
}

export interface TemaGeneral {
  id: string;
  componenteId: string;
  nombre: string;
  activo: boolean;
  preguntas?: Pregunta[];
}

export interface TemaSocioemocional {
  id: string;
  componenteId: string;
  nombre: string;
  activo: boolean;
  preguntas?: Pregunta[];
}

// ==================== PREGUNTAS Y OPCIONES ====================
export interface Opcion {
  id: string;
  preguntaId: string;
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
  esCorrecta: boolean;
}

export interface Pregunta {
  id: string;
  enunciado: string;
  sustento: string;
  esPractica: boolean;
  activo: boolean;
  componenteId: string;
  articuloId?: string;
  subtemaId?: string;
  temaGeneralId?: string;
  temaSocioemocionalId?: string;
  opciones: Opcion[];
}

// ==================== SIMULACROS ====================
export interface IniciarSimulacroRequest {
  componenteId: string;
}

export interface Simulacro {
  id: string;
  userId: string;
  componenteId: string;
  componente?: Componente;
  fechaInicio: string;
  fechaFin?: string;
  puntaje?: number;
  tiempoTotal?: number;
  completado: boolean;
  respuestas?: RespuestaSimulacro[];
}

export interface RespuestaSimulacro {
  id: string;
  simulacroId: string;
  preguntaId: string;
  opcionSeleccionadaId?: string;
  esCorrecta?: boolean;
  tiempoRespuesta?: number;
  pregunta?: Pregunta;
  opcionSeleccionada?: Opcion;
}

export interface ResponderPreguntaRequest {
  opcionId: string;
  tiempoRespuesta?: number;
}

export interface FinalizarSimulacroResponse {
  simulacro: Simulacro;
  puntaje: number;
  correctas: number;
  incorrectas: number;
  sinResponder: number;
}

// ==================== PRÁCTICAS ====================
export interface IniciarPracticaRequest {
  componenteId: string;
  articuloId?: string;
  temaRazonamientoId?: string;
  subtemaId?: string;
  temaGeneralId?: string;
  temaSocioemocionalId?: string;
  soloPractica?: boolean;
}

export interface Practica {
  id: string;
  userId: string;
  componenteId: string;
  componente?: Componente;
  articuloId?: string;
  subtemaId?: string;
  temaGeneralId?: string;
  temaSocioemocionalId?: string;
  fechaInicio: string;
  fechaFin?: string;
  puntaje?: number;
  completado: boolean;
  respuestas?: RespuestaPractica[];
}

export interface RespuestaPractica {
  id: string;
  practicaId: string;
  preguntaId: string;
  opcionSeleccionadaId?: string;
  esCorrecta?: boolean;
  pregunta?: Pregunta;
  opcionSeleccionada?: Opcion;
}

// ==================== ESTADÍSTICAS ====================
export interface EstadisticasGenerales {
  totalSimulacros: number;
  totalPracticas: number;
  promedioGeneral: number;
  rachaActual: number;
  mejorRacha: number;
}

export interface EstadisticasPorComponente {
  componenteId: string;
  componenteNombre: ComponenteNombre;
  totalIntentos: number;
  promedio: number;
  mejorPuntaje: number;
}

export interface EvolucionTemporal {
  fecha: string;
  puntaje: number;
  tipo: 'simulacro' | 'practica';
}

export interface EstadisticasDetalladas {
  generales: EstadisticasGenerales;
  porComponente: EstadisticasPorComponente[];
  evolucion: EvolucionTemporal[];
}

// ==================== ADMIN ====================
export interface CreateUserRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  codigo_pais: string;
  telefono: string;
  rol: 'user' | 'admin';
}

export interface UpdateUserRequest {
  email?: string;
  nombres?: string;
  apellidos?: string;
  activo?: boolean;
  rol?: 'user' | 'admin';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== API RESPONSE ====================
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

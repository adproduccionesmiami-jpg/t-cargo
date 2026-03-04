export type UserRole = 'sociedad1_admin' | 'socio_operativo';

export interface AppUser {
    id: string;
    auth_user_id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    is_active: boolean;
    creado_en: string;
}

export interface AuthState {
    user: AppUser | null;
    session: any | null;
    isLoading: boolean;
    error: string | null;
}

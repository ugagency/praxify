export interface PermissionsUser {
    id: string;
    nome: string;
    email: string;
    grupo_acesso_id?: string | null;
    permissions?: string[];
}

export function hasPermission(user: PermissionsUser | null | undefined, permission: string): boolean {
    if (!user) return false;

    // Admin role override se existir (opcional, dependendo de como você gerencia admins master)
    // if ((user as any).role === 'ADMIN') return true;

    if (!user.permissions || !Array.isArray(user.permissions)) {
        return false;
    }

    return user.permissions.includes(permission);
}

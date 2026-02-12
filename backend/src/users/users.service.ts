import { Injectable, OnModuleInit } from '@nestjs/common';
import { MOCK_USERS, User } from './user.entity';
import { FileStoreService } from '../shared/file-store.service';

@Injectable()
export class UsersService implements OnModuleInit {
    private users: User[] = [];

    constructor(private readonly fileStore: FileStoreService) { }

    onModuleInit() {
        this.users = this.fileStore.load<User[]>('users.json', [...MOCK_USERS]);
        console.log(`[UsersService] Loaded ${this.users.length} users.`);
    }

    private save() {
        this.fileStore.save('users.json', this.users);
    }

    findAll(): User[] {
        return this.users;
    }

    getRanking(): User[] {
        return [...this.users].sort((a, b) => b.xp - a.xp);
    }

    findById(id: string): User | undefined {
        return this.users.find(u => u.id === id);
    }

    updateXp(id: string, amount: number): User | undefined {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.xp += amount;
            this.save();
        }
        return user;
    }

    deleteUser(id: string): boolean {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // Ensure external user exists in our local state for tracking
    upsertUser(externalUser: { id: string; name: string; email?: string }): User {
        let user = this.users.find(u => u.id === externalUser.id);
        if (!user) {
            const isRoot = ['admin', 'developer', 'dev', 'jupiter'].some(k =>
                externalUser.id.toLowerCase().includes(k) ||
                externalUser.name.toLowerCase().includes(k)
            );

            user = {
                id: externalUser.id,
                name: externalUser.name,
                role: isRoot ? 'admin' : 'student',
                title: isRoot ? 'Administrador' : 'Aluno',
                xp: 0
            };
            this.users.push(user);
        } else {
            // Update name if changed
            user.name = externalUser.name;
        }
        this.save();
        return user;
    }

    async loginProxy(body: any) {
        // Sanitize inputs
        const usuarioRaw = body.usuario || body.email || '';
        const senhaRaw = body.senha || body.password || '';

        const apiBody = {
            usuario: usuarioRaw.trim(),
            senha: senhaRaw.trim()
        };

        console.log('Login attempt received in Service:', apiBody.usuario);

        try {
            // Attempt External API Login
            const response = await fetch('https://api.jupiter.com.br/action/Usuario/logar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(apiBody),
            });

            console.log(`External API Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log('External API Success:', data);

                if (data.accessToken && data.usuario) {
                    // Sync/Create local user reference
                    // Note: API only gives us 'usuario', so we use that for name if it's new
                    const localUser = this.upsertUser({
                        id: data.usuario,
                        name: data.usuario // We don't have a better name from this API check
                    });

                    // Return format expected by frontend
                    return {
                        accessToken: data.accessToken,
                        user: {
                            id: localUser.id,
                            usuario: localUser.id,
                            nome: localUser.name,
                            email: "",
                            avatar: "",
                            xp: localUser.xp,
                            role: localUser.role
                        }
                    };
                }
            } else {
                // Log the error body to understand why it failed (e.g. 403 Forbidden)
                const errorText = await response.text();
                console.warn('External API Login Failed. Body:', errorText);
            }
        } catch (error) {
            console.error('External API Request Error (Proceeding to fallback):', error);
        }

        // Fallback: Check Local Users
        // If we reach here, external login failed or excepted.
        // We check if the user exists locally to allow offline/dev access.
        const searchName = apiBody.usuario;
        const localUser = this.users.find(u =>
            u.id === searchName ||
            u.name === searchName ||
            u.id.toLowerCase() === searchName?.toLowerCase()
        );

        if (localUser) {
            console.log('Fallback Login Successful for:', localUser.name);
            return {
                accessToken: `fallback-token-${Date.now()}`,
                user: {
                    id: localUser.id,
                    usuario: localUser.id,
                    nome: localUser.name,
                    email: "",
                    avatar: "",
                    xp: localUser.xp,
                    role: localUser.role
                }
            };
        }

        throw new Error('Falha no login. Verifique suas credenciais.');
    }
}

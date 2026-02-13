import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MOCK_USERS, User } from './user.entity';
import { FileStoreService } from '../shared/file-store.service';

@Injectable()
export class UsersService implements OnModuleInit {
    private users: User[] = [];

    constructor(
        private readonly fileStore: FileStoreService,
        private readonly jwtService: JwtService
    ) { }

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

        const isRoot = ['admin', 'developer', 'dev', 'jupiter'].some(k =>
            externalUser.id.toLowerCase().includes(k) ||
            externalUser.name.toLowerCase().includes(k)
        ) || ['diegodasilva', 'carlosrllj'].includes(externalUser.id.toLowerCase());

        if (!user) {
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
            // Enforce admin role if user is in the admin list
            if (isRoot) {
                user.role = 'admin';
                user.title = 'Administrador';
            }
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

            if (response.ok) {
                const data = await response.json();

                if (data.accessToken && (data.usuario || data.user?.usuario)) {
                    // Sync/Create local user reference
                    // Note: API returns 'user' object with 'usuario' inside
                    const userId = data.usuario || data.user?.usuario;
                    const userName = data.nome || data.user?.nome || userId;

                    const localUser = this.upsertUser({
                        id: userId,
                        name: userName
                    });

                    try {
                        const token = this.jwtService.sign({
                            sub: localUser.id,
                            username: localUser.name,
                            role: localUser.role
                        });

                        // Return format expected by frontend
                        return {
                            accessToken: token,
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
                    } catch (jwtError) {
                        throw jwtError;
                    }
                }
            } else {
                // Log the error body to understand why it failed (e.g. 403 Forbidden)
                const errorText = await response.text();
            }
        } catch (error) {
            // Silent fallback
        }

        // Fallback: Check Local Users REMOVED for security
        // We only allow login via the external API.

        throw new Error('Falha no login. Verifique suas credenciais.');
    }
}

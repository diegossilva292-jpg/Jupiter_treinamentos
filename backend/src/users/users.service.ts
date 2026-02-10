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
            user = {
                id: externalUser.id,
                name: externalUser.name,
                role: 'student', // Default role for new external users
                title: 'Novo Usuário',
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
        console.log('Login attempt received in Service:', body);
        try {
            const response = await fetch('https://api.jupiter.com.br/action/Usuario/logar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            console.log('External API Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('External API Error:', errorText);
                throw new Error(`Falha na autenticação externa: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('External API Success:', data);

            // Sync user to local state immediately upon login
            let localUser: User | undefined;
            if (data.user && data.user.usuario) {
                localUser = this.upsertUser({
                    id: data.user.usuario,
                    name: data.user.nome || data.user.usuario,
                    email: data.user.email
                });
            }

            // Merge local data (XP) into response
            if (localUser) {
                data.user.xp = localUser.xp;
            }

            return data;
        } catch (error) {
            console.error('Proxy Error:', error);
            throw error;
        }
    }
}

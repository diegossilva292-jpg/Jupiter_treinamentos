# 🔄 Database Migration Guide

## Overview
Script para migrar dados de JSON para PostgreSQL usando TypeORM.

## Pré-requisitos
1. PostgreSQL rodando (via Docker Compose)
2. Arquivos JSON em `backend/data/`:
   - `users.json`
   - `courses.json`
   - `progress.json`
   - `certificates.json`

## Comandos

### 1. Migrar Todos os Dados
```bash
cd backend
npm run migrate
```

Migra na ordem correta:
1. Users
2. Courses (com Modules e Lessons)
3. Progress
4. Certificates

**Seguro**: Não sobrescreve dados existentes (checa duplicatas por ID).

### 2. Limpar e Migrar
```bash
cd backend
npm run migrate:clear
```

⚠️ **CUIDADO**: Apaga TODOS os dados do banco antes de migrar!

## Output Esperado

```
═══════════════════════════════════════
  DATABASE MIGRATION TOOL
  JSON → PostgreSQL
═══════════════════════════════════════

📦 Migrating users...
  ✓ Migrated user: Admin
  ✓ Migrated user: João Silva
✅ Users migrated: 2 total

📦 Migrating courses...
  ✓ Migrated course: Curso de TypeScript
    ✓ Module: Fundamentos
      ✓ Lesson: Introdução
      ✓ Lesson: Tipos Básicos
✅ Courses migrated: 1 total

📦 Migrating progress...
  ✓ Migrated progress for user user123
✅ Progress migrated: 5 total

📦 Migrating certificates...
  ✓ Migrated certificate for user user123
✅ Certificates migrated: 1 total

✅ Migration completed successfully!

═══════════════════════════════════════
  Migration completed successfully! 🎉
═══════════════════════════════════════
```

## Troubleshooting

### Erro: "Cannot find module"
```bash
cd backend
npm install
npm run build
npm run migrate
```

### Erro: "Connection refused"
Verifique se o PostgreSQL está rodando:
```bash
docker-compose ps
```

### Erro: "users.json not found"
Os arquivos JSON devem estar em `backend/data/`. O script pula arquivos não encontrados.

## Estrutura dos arquivos JSON

### users.json
```json
[
  {
    "id": "user123",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "student",
    "xp": 100
  }
]
```

### courses.json
```json
[
  {
    "id": "c1",
    "title": "Curso TypeScript",
    "description": "...",
    "modules": [
      {
        "id": "m1",
        "title": "Fundamentos",
        "order": 1,
        "lessons": [
          {
            "id": "l1",
            "title": "Introdução",
            "videoUrl": "...",
            "order": 1
          }
        ]
      }
    ]
  }
]
```

### progress.json
```json
[
  {
    "userId": "user123",
    "lessonId": "l1",
    "status": "COMPLETED",
    "score": 5
  }
]
```

### certificates.json
```json
[
  {
    "userId": "user123",
    "courseId": "c1",
    "issuedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

## Em Produção

1. **Backup dos JSONs**:
```bash
cp -r backend/data backend/data_backup_$(date +%Y%m%d)
```

2. **Rodar migração**:
```bash
cd backend
npm run migrate
```

3. **Verificar no PostgreSQL**:
```bash
docker exec -it jupiter_treinamentos-db-1 psql -U postgres -d jupiter_treinamentos
\dt  # Listar tabelas
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
```

4. **Restart dos containers** (opcional):
```bash
docker-compose restart backend
```

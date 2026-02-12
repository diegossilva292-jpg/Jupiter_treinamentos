# Guia de Deploy - Jupiter LMS

Siga estes passos para colocar sua aplicação no ar na sua VPS.

## 1. Acesso ao Servidor
Acesse sua VPS via SSH (como você já sabe):
```bash
ssh user@seu-ip
```

## 2. Preparar o Código
Navegue até a pasta do projeto e atualize o código:
```bash
cd /caminho/para/projeto
git pull origin main
```
*(Se for a primeira vez: `git clone <URL_DO_REPO>`)*

## 3. Configuração
Entre na pasta `backend` e crie o arquivo `.env` baseado no exemplo:
```bash
cd backend
cp .env.example .env
nano .env
```
**Importante**: Edite o arquivo `.env` e coloque a senha correta do Flussonic em `FLUSSONIC_PASSWORD`.

## 4. Subir a Aplicação
Volte para a raiz do projeto e inicie os containers:
```bash
cd ..
docker-compose up -d --build
```
Isso vai construir o Backend e Frontend e iniciar tudo.

## 5. Configuração do Flussonic (AUTOMATIZADO)
**Novidade:** O Backend agora tenta configurar o Flussonic automaticamente ao iniciar!
Verifique os logs do container (`docker logs jupiter-backend`) para ver se apareceu: `[Flussonic] CORS successfully configured!`.

**Se falhar (ou se o vídeo não tocar):**
Para que os vídeos toquem no navegador, você **PRECISA** configurar o CORS no painel do Flussonic.
1. Acesse: `http://flussonic-tv.jupiter.com.br:8080/admin`
2. Vá nas configurações do VOD (`jupiter_treinamentos`).
3. Adicione este Header nas configurações de Output/Headers:
   ```
   Access-Control-Allow-Origin: *
   ```
4. Salve.

## 6. Verificação
- Frontend: Acesse `http://seu-ip` ou `http://seu-dominio.com`
- Backend: `http://seu-ip:3000`

### Comandos Úteis
- Ver logs do backend: `docker logs -f jupiter-backend`
- Reiniciar tudo: `docker-compose restart`

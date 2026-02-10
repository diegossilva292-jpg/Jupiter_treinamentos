# Guia de Deploy - Jupiter LMS 🚀

Este guia descreve como colocar a plataforma no ar em uma VPS usando Docker.

## Pré-requisitos na VPS

1.  **Git** instalado.
2.  **Docker** e **Docker Compose** instalados.

## Passo a Passo

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/diegossilva292-jpg/Jupiter_treinamentos.git
    cd Jupiter_treinamentos
    ```

2.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na pasta `backend` (ou na raiz, dependendo de como preferir organizar, mas o docker-compose atual espera em `./backend/.env`):

    ```bash
    # Crie o arquivo
    nano backend/.env
    ```

    **Conteúdo do .env:**
    ```env
    FLUSSONIC_URL=http://flussonic-tv.jupiter.com.br:8080
    FLUSSONIC_USER=admin
    FLUSSONIC_PASSWORD=hpdl380
    FLUSSONIC_VOD_NAME=jupiter_treinamentos
    ```

3.  **Subindo a Aplicação:**
    Na raiz do projeto (onde está o `docker-compose.yml`), execute:

    ```bash
    docker-compose up -d --build
    ```

    *   `up`: sobe os containers.
    *   `-d`: modo "detached" (roda em segundo plano).
    *   `--build`: força a reconstrução das imagens para garantir que pegou as últimas alterações.

4.  **Verificando:**
    *   O Frontend estará acessível no IP da sua VPS (porta 80).
    *   O Backend estará na porta 3000.

## Atualizando a Aplicação (Git Pull via Rebase)

Sempre que você fizer alterações no código e enviar para o GitHub, faça o seguinte na VPS para atualizar:

```bash
# Baixa as alterações
git pull

# Reconstrói e reinicia os containers
docker-compose up -d --build
```

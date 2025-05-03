
# Implantação da Aplicação Quiz com Docker e Portainer

Este documento fornece instruções completas para implantar a aplicação Quiz usando Docker e Portainer, com configurações avançadas de rede e domínio.

## Usando Docker Compose localmente

Para executar a aplicação localmente usando Docker:

```bash
docker-compose up -d
```

Acesse a aplicação em `http://localhost` ou através do domínio configurado.

### Configurações de Banco de Dados (Supabase)

O Docker Compose inclui um contêiner PostgreSQL configurado para o Supabase:
- **Host**: localhost
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres
- **Banco de dados**: postgres

## Implantação via Docker Swarm com Portainer

### Pré-requisitos
- Docker Swarm inicializado (`docker swarm init`)
- Portainer instalado e configurado
- Acesso ao repositório Git
- [Opcional] Traefik configurado para gerenciamento de SSL (ou use o Nginx incluído)

### Passos para implantação
1. No Portainer, vá para "Stacks" e clique em "Add stack"
2. Escolha "Git repository" como método de implantação
3. Configure o repositório:
   - URL do repositório: seu-repositorio-git
   - Branch de referência: main (ou sua branch principal)
   - Caminho do Compose: deixe em branco se o arquivo estiver na raiz
   - Autenticação: configure se o repositório for privado

4. **Variáveis de Ambiente**: Configure a variável `DOMAIN` antes de implantar:
   - Adicione uma variável: Nome=`DOMAIN`, Valor=`seudominio.com.br`

5. Clique em "Deploy the stack"

### Configuração de Domínio e SSL

#### Usando Nginx (incluído no docker-compose.yml)

1. **Para configurar seu domínio personalizado**:
   - Configure a variável de ambiente `DOMAIN` no Portainer antes do deploy
   - Certifique-se de ter registros DNS apontando para seu servidor

2. **Para adicionar SSL com Nginx**:
   - Coloque os arquivos de certificado em `nginx/certs/` (fullchain.pem e privkey.pem)
   - Descomente a seção SSL no arquivo `nginx/default.conf`
   - Reinicie o serviço nginx: `docker service update --force stack_name_nginx`

#### Usando Traefik (integração avançada)

Se você tem o Traefik configurado como proxy reverso em seu ambiente Swarm ou Portainer:

1. No docker-compose.yml, certifique-se que as labels do Traefik estejam configuradas corretamente
2. Comente ou remova o serviço nginx se estiver usando apenas Traefik
3. Configure o Traefik para usar o certresolver mencionado nas labels

### Solução de problemas comuns no Docker Swarm

#### Problemas com a rede overlay

Se aparecer o erro "A rede não pode ser usada com serviços":
- Certifique-se que o driver da rede é `overlay` (já configurado neste docker-compose.yml)
- Verifique se o Docker está em modo Swarm (`docker info | grep Swarm`)
- Se não estiver em modo Swarm, inicialize-o com `docker swarm init`

#### Problemas com o acesso ao volume

Se os contêineres não conseguirem acessar os volumes:
- Verifique se os volumes são acessíveis em todos os nós do swarm
- Considere usar um driver de volume compatível com swarm (ex: NFS)

#### Visualizando logs no Swarm

```bash
# Ver logs da aplicação
docker service logs stack_name_quiz-app

# Ver logs do nginx
docker service logs stack_name_nginx

# Ver logs do banco de dados
docker service logs stack_name_supabase-db
```

### Backup do Banco de Dados

Para fazer backup do banco de dados Supabase:

```bash
docker exec $(docker ps -q -f name=stack_name_supabase-db) pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

Para restaurar um backup:

```bash
cat backup_file.sql | docker exec -i $(docker ps -q -f name=stack_name_supabase-db) psql -U postgres -d postgres
```

### Escalabilidade e Performance

Para escalar a aplicação em ambientes de produção:
```bash
docker service scale stack_name_quiz-app=2
```

### Monitoramento no Swarm

Para monitorar seus serviços:
```bash
docker service ls
docker service ps stack_name_quiz-app
```

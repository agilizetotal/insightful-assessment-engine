
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

## Implantação via Portainer

### Pré-requisitos
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
   - Reinicie o serviço nginx: `docker-compose restart nginx`

#### Usando Traefik (integração avançada)

Se você tem o Traefik configurado como proxy reverso em seu ambiente Swarm ou Portainer:

1. No docker-compose.yml, certifique-se que as labels do Traefik estejam configuradas corretamente
2. Comente ou remova o serviço nginx se estiver usando apenas Traefik
3. Configure o Traefik para usar o certresolver mencionado nas labels

### Escalabilidade e Performance

O arquivo docker-compose.yml inclui configurações para:
- Gerenciamento de recursos (limits de CPU e memória)
- Políticas de reinicialização
- Configuração para ambiente Swarm

Para escalar a aplicação em ambientes de produção:
```bash
docker service scale stack_name_quiz-app=2
```

### Redis para Cache (Opcional)

O docker-compose inclui um servidor Redis que pode ser usado para:
- Armazenamento de sessão
- Cache de aplicação
- Filas de processamento

Para usar o Redis na aplicação, configure as variáveis de ambiente apropriadas.

### Solução de problemas comuns

#### Problemas com Docker Compose

Se encontrar o erro "Open /data/compose/XX/docker-compose.yml: no such file or directory":

1. Verifique se o arquivo docker-compose.yml está realmente na raiz do repositório
2. Certifique-se de que o Portainer tenha permissão para acessar o repositório
3. Verifique se selecionou a branch correta
4. Se o arquivo estiver em um subdiretório, especifique o caminho relativo exato no campo "Compose path"

#### Problemas de Rede

Se a aplicação não estiver acessível pelo domínio configurado:

1. Verifique se os registros DNS estão configurados corretamente
2. Confirme se as portas 80/443 estão abertas no firewall do servidor
3. Verifique os logs do contêiner para identificar problemas:
   ```bash
   docker logs quiz-nginx
   docker logs insightful-assessment-engine
   ```

#### Problemas de Certificado SSL

Se estiver tendo problemas com certificados SSL:

1. Verifique se os arquivos do certificado estão no formato correto e localização adequada
2. Confirme as permissões dos arquivos de certificado (devem ser legíveis pelo usuário nginx)
3. Se estiver usando Traefik, verifique se o certresolver está configurado corretamente

### Monitoramento e Logs

Para monitorar a aplicação:

```bash
# Ver logs da aplicação
docker logs -f insightful-assessment-engine

# Ver logs do nginx
docker logs -f quiz-nginx

# Ver logs do banco de dados
docker logs -f quiz-supabase-db
```

### Backup do Banco de Dados

Para fazer backup do banco de dados Supabase:

```bash
docker exec quiz-supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

Para restaurar um backup:

```bash
cat backup_file.sql | docker exec -i quiz-supabase-db psql -U postgres -d postgres
```



# Implantação da Aplicação com Docker e Portainer

Este documento fornece instruções para implantar a aplicação Quiz usando Docker e Portainer.

## Usando Docker Compose localmente

Para executar a aplicação localmente usando Docker:

```bash
docker-compose up -d
```

Acesse a aplicação em `http://localhost:3000`

## Implantação via Portainer

### Pré-requisitos
- Portainer instalado e configurado
- Acesso ao repositório Git

### Passos para implantação
1. No Portainer, vá para "Stacks" e clique em "Add stack"
2. Escolha "Git repository" como método de implantação
3. Configure o repositório:
   - URL do repositório: seu-repositorio-git
   - Branch de referência: main (ou a branch que contém o docker-compose.yml)
   - Caminho do Compose: deixe em branco se o arquivo estiver na raiz
   - Autenticação: configure se o repositório for privado

4. Clique em "Deploy the stack"

### Solução de problemas comuns

Se encontrar o erro "Open /data/compose/XX/docker-compose.yml: no such file or directory":

1. Verifique se o arquivo docker-compose.yml está realmente na raiz do repositório
2. Certifique-se de que o Portainer tenha permissão para acessar o repositório
3. Verifique se selecionou a branch correta
4. Se o arquivo estiver em um subdiretório, especifique o caminho relativo exato no campo "Compose path"
5. Tente clonar o repositório manualmente e verificar se o arquivo docker-compose.yml está presente
6. Verifique os logs do Portainer para diagnósticos adicionais

### Configuração de variáveis de ambiente

Para configurar variáveis de ambiente sensíveis como chaves de API:

1. Na interface do Portainer, ao criar a stack, role para baixo até "Environment variables"
2. Adicione suas variáveis de ambiente conforme necessário

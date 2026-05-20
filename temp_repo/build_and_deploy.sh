#!/bin/bash
set -e

echo "==> Construindo a imagem da API..."
docker build -t integrador-api:latest ./api

echo "==> Construindo a imagem do WEB..."
docker build -t integrador-web:latest ./web

echo "==> Imagens construídas com sucesso!"
echo "Para aplicar as alterações, vá até o Portainer e reinicie os containers (ou atualize o serviço para forçar ele a pegar a nova imagem)."

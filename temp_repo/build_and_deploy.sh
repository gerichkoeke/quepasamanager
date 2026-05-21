#!/bin/bash
set -e

echo "==> Construindo a imagem da API..."
docker build -t integrador-api:latest ./api

echo "==> Construindo a imagem do WEB..."
docker build -t integrador-web:latest ./web

echo "==> Imagens construídas com sucesso!"
echo "==> Atualizando serviços no Docker Swarm..."
docker service update --force quepasahub_quepasahub_api || echo "Aviso: Nao foi possivel atualizar quepasahub_quepasahub_api"
docker service update --force quepasahub_quepasahub_web || echo "Aviso: Nao foi possivel atualizar quepasahub_quepasahub_web"

echo "Deploy concluído com sucesso!"

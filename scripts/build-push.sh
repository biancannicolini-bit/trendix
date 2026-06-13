#!/usr/bin/env bash
# Solo para emergencias locales. En producción: push a main → GitHub Actions.
set -euo pipefail

REGISTRY="${REGISTRY:-localhost:5000/trendcontent}"
TAG="${TAG:-latest}"

echo "Building app..."
docker build -t "${REGISTRY}/trendcontent-app:${TAG}" .

echo "Building python service..."
docker build -t "${REGISTRY}/trendcontent-python:${TAG}" ./python-service

echo "Pushing images..."
docker push "${REGISTRY}/trendcontent-app:${TAG}"
docker push "${REGISTRY}/trendcontent-python:${TAG}"

echo "Done. Deploy in Portainer with docker-stack.yml"

#! bin/sh
VERSION=4.0.0

IMAGE="gpato/lacen-base"

# Create logs directory if it doesn't exist
mkdir -p logs

# Generate timestamp for log file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/build_${TIMESTAMP}.log"

# build REUSING STEPS
docker build . -t $IMAGE:$VERSION --progress=plain > "$LOG_FILE" 2>&1

# build FROM SCRATCH
# docker build --no-cache . -t $IMAGE:$VERSION --progress=plain > "$LOG_FILE" 2>&1

# tags
docker tag $IMAGE:$VERSION $IMAGE:latest
docker tag $IMAGE:$VERSION $IMAGE:$VERSION

# login
if [ ! -f dockerhub-auth.txt ]; then
    echo "dockerhub-auth.txt file not found! This file should contain the dockerhub password"
fi
cat dockerhub-auth.txt | docker login --username gpato --password-stdin

# push
docker push $IMAGE:$VERSION
docker push $IMAGE:latest
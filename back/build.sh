#! bin/sh
# get version from package.json
VERSION=$(awk -F: '/"version":/ {print substr($2, 3, length($2)-4)}' package.json)

if [ -z "$VERSION" ]
  then
    echo $VERSION
    echo "[err] No version found in package.json"
    return 1
fi

IMAGE="gpato/lacen-app"
echo "Building gpato/lacen-app"

# build
docker build --no-cache . -t $IMAGE:$VERSION

# tags
docker tag $IMAGE:$VERSION $IMAGE:latest
docker tag $IMAGE:$VERSION $IMAGE:$VERSION

# login
cat dockerhub-auth.txt | docker login --username gpato --password-stdin

# push
docker push $IMAGE:$VERSION
docker push $IMAGE:latest
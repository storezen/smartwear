#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing NPM dependencies..."
npm install --include=dev

echo "Generating Prisma Client and Pushing Schema..."
npx prisma generate
npx prisma db push

echo "Building Next.js Project..."
npm run build

# Download Chrome for Render so Puppeteer can work without crashing
STORAGE_DIR=/opt/render/project/src/.render
if [[ ! -d $STORAGE_DIR/chrome ]]; then
  echo "...Downloading Chrome for Puppeteer"
  mkdir -p $STORAGE_DIR/chrome
  cd $STORAGE_DIR/chrome
  wget -P ./ https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  dpkg -x ./google-chrome-stable_current_amd64.deb $STORAGE_DIR/chrome
  rm ./google-chrome-stable_current_amd64.deb
  cd /opt/render/project/src
else
  echo "...Using Chrome from cache"
fi

echo "Build Completed Successfully!"

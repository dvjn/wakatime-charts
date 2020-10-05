#!/bin/bash

set -e

REPOSITORY_NAME="${GITHUB_REPOSITORY##*/}"
REPOSITORY_URL="https://github.com/${GITHUB_REPOSITORY}.git"
REMOTE_REPOSITORY="https://${GITHUB_ACTOR}:${INPUT_GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

node generate-charts.js
echo Generated charts

git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config --global user.name "GitHub Actions"
echo Configured git

git clone --single-branch --branch "${INPUT_BRANCH_NAME}" "${REPOSITORY_URL}" repository
cd repository
git remote add publish "${REMOTE_REPOSITORY}"
git checkout "${INPUT_BRANCH_NAME}"
git pull
echo Cloned repository

if [[ ! -d "${INPUT_IMAGES_FOLDER}" ]]
then
    mkdir -p "${INPUT_IMAGES_FOLDER}"
    echo Created images folder
fi

cp -a ../generated/. "${INPUT_IMAGES_FOLDER}"
echo Copied images

git add "${INPUT_IMAGES_FOLDER}"
git commit -m "${INPUT_COMMIT_MESSAGE}"
git push publish ${INPUT_BRANCH_NAME}
echo Pushed changes

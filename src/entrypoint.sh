#!/bin/bash

set -e

cd /app

REMOTE_REPOSITORY="https://${GITHUB_ACTOR}:${INPUT_GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

node generate-charts.js
echo Generated charts

git config --global user.email "${INPUT_GIT_USER_EMAIL}"
git config --global user.name "${INPUT_GIT_USER_NAME}"
echo Configured git

git clone --single-branch --branch "${INPUT_BRANCH_NAME}" "${REMOTE_REPOSITORY}" repository > /dev/null
cd repository
git remote add publish "${REMOTE_REPOSITORY}" > /dev/null
git checkout "${INPUT_BRANCH_NAME}" > /dev/null
git pull > /dev/null
echo Cloned repository

if [[ ! -d "${INPUT_IMAGES_FOLDER}" ]]
then
    mkdir -p "${INPUT_IMAGES_FOLDER}"
    echo Created images folder
else
    echo Images folder already exists
fi

cp -a ../generated/. "${INPUT_IMAGES_FOLDER}"
echo Copied images

git add "${INPUT_IMAGES_FOLDER}" > /dev/null 
if [ -n "$(git status --porcelain)" ]
then
    git commit -m "${INPUT_COMMIT_MESSAGE}" > /dev/null
    echo Commited changes
    git push publish ${INPUT_BRANCH_NAME} > /dev/null
    echo Pushed changes
else
    echo No changes to commit
fi

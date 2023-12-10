#!/bin/sh

set -e # Exit immediately if a command exits with a non-zero status

yarn sequelize db:migrate
yarn sequelize db:seed:all
yarn watch

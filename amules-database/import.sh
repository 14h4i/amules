#!/usr/bin/env bash
# Usage: ./import.sh "mongodb://localhost:27017" amules
URI=${1:-mongodb://localhost:27017}; DB=${2:-amules}
for f in *.json; do mongoimport --uri "$URI" --db "$DB" --collection "${f%.json}" --file "$f" --jsonArray --drop; done

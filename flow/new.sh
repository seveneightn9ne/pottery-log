#!/usr/bin/env bash
set -e # errexit
set -u # nounset

cat <<EOF > "$1.js"
declare module '$1' {
  declare module.exports: any;
}
EOF

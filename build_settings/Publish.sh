#!/bin/bash

##################################################
# gitに登録してnpmに公開
##################################################

if [ $# -ne 1 ]; then
  echo "引数が足りません"
  echo "./Publish バージョン番号"
  echo "ex) ./Publish 1.0.0"
  exit 1
fi

VERSION=$1

git commit -a -m "本番用ビルド${VERSION}"
git tag -a "${VERSION}" -m "本番用ビルド"
git push origin master
git push origin --tags

npm publish
#!/usr/bin/env bash

set e+x
echo "Getting git refs"

git show-ref --head --heads | while IFS=' ' read -r hash name;
do
  echo "ref $name hash $hash"
  test ! -e "${GIT_DIR:-.git}/$name" && echo $hash > "${GIT_DIR:-.git}/$name";
done

echo "All done"

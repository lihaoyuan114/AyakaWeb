```bash
#!/usr/bin/env bash

set -e

echo "===> Syncing..."
git pull --rebase

echo "===> Adding diary..."
git add Resource/Data/diary.json

# 如果没有修改则退出
if git diff --cached --quiet; then
    echo "No changes in Resource/Data/diary.json"
    exit 0
fi

echo "===> Committing..."
git commit -m "[DiaryUpdate] Update diary ($(date '+%Y-%m-%d %H:%M'))"

echo "===> Pushing..."
git push

echo "✅ Finished!"
```

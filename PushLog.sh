#!/usr/bin/env bash

# 1. 并发锁：防止 AI 同时调用两次导致 Git 冲突
exec 9>/tmp/ayakaweb_push.lock
if ! flock -n 9; then
    echo "❌ 另一个推送任务正在运行，跳过本次推送。"
    exit 1
fi

cd ~/AyakaWeb || { echo "❌ 找不到 AyakaWeb 目录"; exit 1; }

# 2. 清理可能卡死的 rebase 状态（比如上一次脚本崩了）
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo "⚠️ 发现卡死的 rebase 状态，正在自动清理..."
    git rebase --abort
fi

# 3. 检查是否有实际需要提交的修改（提前检查，避免浪费网络请求）
git add Resource/Data/diary.json
if git diff --cached --quiet; then
    echo "ℹ️ 日记没有变化，无需推送。"
    exit 0
fi

echo "===> Syncing..."
git fetch origin

# 4. 暂存当前的修改（包括未跟踪的文件），把工作区变干净
echo "===> Stashing local changes..."
git stash -u

# 5. 拉取远端代码（使用 rebase 保持线性历史）
echo "===> Pulling origin main..."
# 忽略 pull 的错误（如果完全没有上游也可以继续）
git pull --rebase origin main || true

# 6. 恢复暂存的修改
echo "===> Restoring local changes..."
if ! git stash pop; then
    echo "❌ 发生冲突（远端也有人修改了 diary.json）。"
    echo "⚠️ 正在尝试自动合并... (保留双方改动)"
    # 如果是 JSON 冲突，这里只能提示，严重冲突需人工介入
    git status
    # 退出代码 2 代表冲突，让 Python 端捕获
    exit 2
fi

# 7. 提交并推送
echo "===> Committing..."
git add Resource/Data/diary.json
git commit -m "[DiaryUpdate] Update diary ($(date '+%Y-%m-%d %H:%M'))"

echo "===> Pushing..."
if ! git push origin main; then
    echo "⚠️ Push 被拒绝，尝试重新同步后再推..."
    git pull --rebase origin main || true
    git push origin main || { echo "❌ Push 彻底失败，请手动检查"; exit 3; }
fi

echo "✅ Finished!"
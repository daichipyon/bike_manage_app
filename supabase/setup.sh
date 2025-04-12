#!/bin/bash

# Supabase CLIのインストール確認
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLIがインストールされていません。インストールします..."
    brew install supabase/tap/supabase
fi

# Supabaseローカル環境の初期化
echo "Supabaseローカル環境を初期化しています..."
supabase init

# Supabaseローカルサービスの開始
echo "Supabaseローカルサービスを開始しています..."
supabase start

echo "セットアップが完了しました！"
echo "Supabase Studio URL: http://localhost:54323"
echo "Supabase API URL: http://localhost:54321"
echo "Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "停止するには 'supabase stop' コマンドを使用してください"
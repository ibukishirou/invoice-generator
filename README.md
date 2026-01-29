# 請求書自動作成ツール

- URL: https://ibukishirou.github.io/invoice-generator/
- 個人事業主向けのサーバーレス請求書・見積書・納品書作成Webアプリケーション
- サーバーとの通信はなし、JSONファイルを自身でアップ・ダウンロードして管理

## 機能

- 📄 **4種類の書類作成**: 請求書、発注書、見積書、納品書
- 💰 **消費税対応**: 内税、外税に対応
- 🧾 **インボイス制度対応**: 登録番号の表示に対応
- 💾 **履歴保存**: 作成した書類のデータを自動保存、自身で名前を付けて保存も可能
- 🖨️ **印刷対応**: A4サイズでの印刷に対応
- 📤 **エクスポート**: PDF、JPG、PNG形式でダウンロード可能

## 使い方

1. 書類種別を選択（請求書/発注書/見積書/納品書）
2. 自社情報と取引先情報を入力
3. 明細行を追加・編集
4. リアルタイムでプレビューを確認
5. 好きな形式でダウンロード

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **PDF生成**: jsPDF
- **画像変換**: html2canvas
- **デプロイ**: GitHub Pages

## ローカル開発

```bash
# 依存関係のインストール
npm install --legacy-peer-deps

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ

### GitHub Actionsによる自動デプロイ

mainブランチへのpush時に自動的にGitHub Pagesにデプロイされる。

**初回セットアップ手順:**

1. GitHubリポジトリの「Settings」タブを開く
2. 左メニューから「Pages」を選択
3. 「Source」を **「GitHub Actions」** に変更
4. ワークフローファイル（`.github/workflows/deploy.yml`）がmainブランチにpushされると自動的にデプロイが開始

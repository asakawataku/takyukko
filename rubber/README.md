# たきゅポチ 分離版

同じフォルダに以下4ファイルを置きます。

- index.html
- takyupochi.css
- takyupochi.js
- rubbers.json

`images/` フォルダは元ページと同じ相対位置に置いてください。

## 商品追加
`rubbers.json` に1件追加するだけでカードが自動生成されます。

## 注意
ブラウザで `file://` として index.html を直接開くと、ブラウザのCORS制約で `fetch('./rubbers.json')` が失敗する場合があります。Firebase Hosting、ローカルサーバー（Live Server等）で確認してください。

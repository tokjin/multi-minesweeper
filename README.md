# multi-minesweeper

![image](https://github.com/tokjin/multi-minesweeper/assets/41167277/eec3fde8-4d74-4b78-9ae2-1b0c953c725f)

クライアント側はhtmlで、
サーバーサイドはnode.jsで動くマルチプレイができるマインスイーパーです。

全然作りこんでいないのでこのままだと楽しくないですが何かの参考になれば。

`npm install express ws`
`node server.js`
http://localhost:3000 にアクセスすれば遊べます。
別のPCからアクセスしたい時はlocalhostをよしなに変更してください。

multi-minesweeper/
├── node_modules/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
└── package-lock.json

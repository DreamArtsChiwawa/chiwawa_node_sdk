## 概要
知話輪の公開APIをNode.jsから簡単に使えるようにするためのSDKです。

## はじめに
知話輪の概要、および、APIの仕様やチュートリアルについては、下記を参照してください。なお、知話輪のAPIは一般的なREST APIであるため、このSDKを用いなくても使うことができ、かつ、他の開発言語でも利用可能です。

- [知話輪とは](https://www.chiwawa.one/)
- [知話輪APIドキュメント](https://developers.chiwawa.one/api/index.html)
- [知話輪API利用ガイド・サンプルコード](https://github.com/DreamArtsChiwawa/APIGuides)

## セットアップ
SDKをインストール。
```.sh
npm install chiwawa_node_sdk --save
```

知話輪管理画面でAPIトークンとWebhook検証トークンを発行し、ボット実行環境の環境変数にセットする。

| 環境変数名 | 値 |
|---|---|
| CHIWAWA_API_TOKEN | 知話輪のAPIトークン |
| CHIWAWA_VALIDATION_TOKEN | 知話輪のWebhook検証トークン |

## 基本的な利用方法
SDKを呼びだす。
```.js
const ChiwawaService = require("chiwawa_node_sdk");
```

リクエストに正しい検証用トークンがセットされているかをチェックする。
```.js
if (ChiwawaService.isValidRequest(req)) {
  // OK
} else {
  // NG
}
```

知話輪からのリクエストからデータを取り出す。
```.js
let messageText = ChiwawaService.getMessageText(req);
```

知話輪にメッセージを送信する。
```.js
ChiwawaService.sendMessage(req, "Hello Chiwawa Bot!!", (err, httpResponse, body) => {});
```

## 次のステップ
- [知話輪ボット作成手順　Javascript on Azure Functions編](https://github.com/DreamArtsChiwawa/APIGuides/blob/master/document/CreateBotWithJavascriptOnAzureFunctions.md)

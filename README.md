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

知話輪管理画面でAPIトークンとWebhook検証トークンを発行し、アプリケーションの実行環境の環境変数にセットする。

| 環境変数名 | 値 |
|---|---|
| CHIWAWA_API_TOKEN | 知話輪のAPIトークン |
| CHIWAWA_VALIDATION_TOKEN | 知話輪のWebhook検証トークン |

## 基本的な利用方法
### SDKの呼び出し
```.js
const ChiwawaService = require("chiwawa_node_sdk");
```

### 知話輪からのリクエストの処理
リクエストに正しい検証用トークンがセットされているかをチェックする。
```.js
if (ChiwawaService.isValidRequest(req)) {
  // OK
} else {
  // NG
}
```

リクエストからメッセージ本文を取り出す。
```.js
const messageText = ChiwawaService.getMessageText(req);
```

リクエストから企業IDを取り出す。
```.js
const companyId = ChiwawaService.getCompanyId(req);
```

リクエストからグループIDを取り出す。
```.js
const groupId = ChiwawaService.getGroupId(req);
```

### 知話輪に対するメッセージの送信
知話輪にテキストメッセージを送信する。
```.js
ChiwawaService.sendMessage(req, "Hello Chiwawa Bot!!", (err, httpResponse, body) => {});
```

知話輪にテキストアタッチメントを送信する。
```.js
// テキストアタッチメントなど、単純なテキストメッセージ以外を送りたい場合は、MessageDataBuilderを用いてデータオブジェクトを組み立てると便利。
const content = ChiwawaService.MessageDataBuilder.newMessageDataWithTextAttachment("メッセージ本文＋テキストアタッチメント（プレーンテキスト）", "アタッチメントタイトル", "アタッチメントの本文。");
// sendMessageRawDataを用いると、自分で組み立てたデータオブジェクトを送信することができる。
ChiwawaService.sendMessageRawData(req, content, function(err, httpResponse, body) {
  if (err || 200 !== httpResponse.statusCode) {
    // エラー
  } else {
    // 成功
  }
});
```

知話輪にアクションボタン付きのテキストアタッチメントを送信する。
```.js
// アクションボタンを作成
const postAction = ChiwawaService.MessageDataBuilder.newTextAttachmentAction("POSTボタン", null, "detail", "https://YOUR_APP_DOMAIN", "post", {}, "json");
// attachmentにアクションボタンをセット
const attachment = ChiwawaService.MessageDataBuilder.newTextAttachment("アタッチメントタイトル", "# 見出し1\n## 見出し2\n### 見出し3\n- 箇条書き1\n- 箇条書き2\n- 箇条書き3\n\n|タイトル1|タイトル2|\n|---|---|\n|中身1|中身2|", "md", "#ff0000", ["lock", "check"], "yes", [postAction]);
// 上記で作成したattachmentをセット（attachmentは配列で複数指定可）
const content = ChiwawaService.MessageDataBuilder.newMessageDataWithAttachments("テキストアタッチメントを送信（アクションの指定）", [attachment]);
// メッセージを送信
ChiwawaService.sendMessageRawData(getRequest(), content, function(err, httpResponse, body) {
  if (err) {
    assert.fail(err);
  } else {
    assert.equal(httpResponse.statusCode, 200);
  }
  done();
});
```

## 次のステップ
- [知話輪ボット作成手順　Javascript on Azure Functions編](https://github.com/DreamArtsChiwawa/APIGuides/blob/master/document/CreateBotWithJavascriptOnAzureFunctions.md)

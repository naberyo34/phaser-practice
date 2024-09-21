# 機能強化 1

## タイトル画面を追加する

シーン遷移を行う方法を学んだ。ゲームオーバーになったときは再びタイトル画面に戻る。
シーン間でグローバルな値を引き回したい場合は、単純なものであれば `this.registry` を利用できる。
これを用いてハイスコア機能を実装した。

## プレイヤーのコードを分割する

`Phaser.Physics.Arcade.Sprite` を継承するクラスを新規に定義した。書き方は試行錯誤が必要そう。

## バウンドする / 下から潜り抜けられる床を作る

see: https://github.com/phaserjs/examples/blob/master/public/src/physics/arcade/collider%20process%20callback.js

```ts
this.physics.add.collider(this.player, window, undefined, (player) => {
  if (this.cursors.down.isDown) {
    return false
  }
  return (
    (player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
      .y > 0
  )
})
```

下キーを押すと降りられる。
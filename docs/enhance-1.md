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

## プレイヤーとオブジェクトの接触時のみ色を変える

```ts
getIsNear(target: Phaser.Physics.Arcade.Sprite) {
  this.isNear =
    Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) < 30

  if (this.isNear) {
    this.setTint(0xff0000)
  } else {
    this.clearTint()
  }

  return this.isNear
}
```

`overlap` や `embedded` は

- 接触の解除を判定しづらい
- 接触しているオブジェクトを判別できないので、ステージに接地していると接触判定されてしまう

という問題があり、一定距離内にいるかを判定に用いることにした。けっこう気持ちよく動く。

## オブジェクトを掴む / 投げる

```ts
/**
 * 近接しているオブジェクトを「つかむ」
 */
hold() {
  if (this.nearObject) {
    this.holdObject = this.nearObject
    this.holdObject.disableBody()
  }
}

/**
 * 近接しているオブジェクトを「なげる」
 */
throw(direction: { x: number; y: number }) {
  if (this.holdObject) {
    this.holdObject.enableBody()
    this.holdObject.setVelocity(direction.x, direction.y || -200)
    this.holdObject.setBounce(0.5)
    this.holdObject = undefined
  }
}
```

```ts
update() {
  // ...

  // つかんでいるオブジェクトを追従させる
  if (this.holdObject) {
    this.holdObject.x = this.x + (this.isFlip ? 30 : -30)
    this.holdObject.y = this.y
  }

  // つかむ
  if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
    if (!this.holdObject && this.nearObject) {
      this.hold()
    }
  }

  // なげる
  if (this.keyZ.isUp) {
    if (this.holdObject) {
      // 投げる方向
      const direction = (() => {
        const result = { x: 0, y: 0 }
        if (this.cursors.up.isDown) {
          result.y = -400
        }

        if (this.cursors.right.isDown) {
          result.x = 400
        }

        if (this.cursors.down.isDown) {
          result.y = 400
        }

        if (this.cursors.left.isDown) {
          result.x = -400
        }
        return result
      })()
      this.throw(direction)
    }
  }
}
```

`disableBody()` で、掴んでいる間だけ重力の影響を受けなくすることでオブジェクトがガタガタ移動するのを防いでいる。

## タイムアップ制にする

```ts
this.timer = this.time.addEvent({
  delay: 1000,
  callback: this.countDown,
  callbackScope: this,
  loop: true,
})
```

```ts
countDown() {
  this.timerCount -= 1
  if (this.timerCount === 0) {
    this.timer.destroy()
  }
}
```

```ts
update() {
  // ...
  // タイマー
  this.timerText.setText(this.timerCount.toString())
  if (this.timerCount === 0) {
    this.gameOver()
  }
}
```

これが多分シンプル。

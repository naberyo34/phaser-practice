# 機能強化 1

## タイトル画面を追加する

```ts
update() {
  if (this.isGameEnd) {
    if (this.cursors.space.isDown) {
      this.scene.start('title')
    }
    return
  }
}
```

ゲームオーバーになったときは再びタイトル画面に戻る。
シーン間でグローバルな値を引き回したい場合は、単純なものであれば `this.registry` を利用する。
ゲームのハイスコアなどは、ローカルストレージに保存して初期化時に呼び出す形式でもよい。

## プレイヤーのコードを分割する

`Phaser.Physics.Arcade.Sprite` を継承するクラスを新規に定義した。書き方は試行錯誤が必要そう。

## バウンドする / 下から潜り抜けられる床を作る

see: https://github.com/phaserjs/examples/blob/master/public/src/physics/arcade/collider%20process%20callback.js

`collider` や `overlap` は、第4引数にbooleanを返す関数を与えることで、特定条件で接触判定を無視することができる。

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

`delay` 1秒でループあり = 1秒ごとにコールバックを実行する、の意。

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

## 結果発表が終わりタイトルに戻ってから、ゲームをリスタートする

シーンを切り替えただけではシーンの状態はリセットされないため、初期化してからリスタートする必要がある。

```ts
init() {
  this.isGameOver = false
  this.isGameEnd = false
  this.cursors = this.input.keyboard!.createCursorKeys()
  this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
  this.timer = this.time.addEvent({
    delay: 1000,
    callback: this.countDown,
    callbackScope: this,
    loop: true,
  })
  this.timerCount = 5

  this.score = 0
  this.objectCount = {
    wastepaper: { label: '紙くず', count: 0 },
    can: { label: '缶', count: 0 },
    bottle: { label: 'ペットボトル', count: 0 },
    garbageBag: { label: 'ゴミ袋', count: 0 },
  }

  this.physics.resume()
}
```

`preload()` よりも前に実行する初期化処理として `init()` があるため、ここでメンバー変数を初期化するとよい。

- メンバー変数を宣言する際に値を代入してしまうと、シーンを2回以上起動した際に値が初期化されないため `init()` 内で代入する
- この時点で `preload()` は行われていないので、アセットへのアクセスが必要な処理ができない（たとえば前シーンで流したBGMを止めたいなら、 `create()` で `this.sound.pauseAll()` する）

点がポイント。
また、ゲーム終了時に `this.physics.pause()` でオブジェクトの物理的動作を停止させているため、ここで `resume()` で再開している。
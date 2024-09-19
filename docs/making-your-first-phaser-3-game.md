# Making your first phaser 3 game.

- https://phaser.io/tutorials/making-your-first-phaser-3-game/part1

## ゲームを起動する

`config` オブジェクトでレンダラーの寸法など基本的な設定を行い、`new Phaser.Game(config)` インスタンスを立ち上げるとゲームが起動する。

とくに指定しない限り、レンダリングはWebGLによって行われるが、ブラウザが対応していない場合はcanvasにフォールバックされる。

## アセットを読み込む

シーンの `preload()` によって必要なアセットをロードする。

```ts
preload() {
	this.load.image('sky', 'assets/sky.png')
	this.load.image('ground', 'assets/platform.png')
	this.load.image('star', 'assets/star.png')
	this.load.image('bomb', 'assets/bomb.png')
	this.load.spritesheet('dude', 'assets/dude.png', {
			frameWidth: 32,
			frameHeight: 48,
		})
}
```

アセットをロードする際は `sky` のように識別子をつける。
`create()` によって、事前にロードしたアセットを画面上に描画できる。

```ts
this.add.image(400, 300, 'sky') // x: 400, y: 300
this.add.image(400, 100, 'star')
```

Phaser 3において、すべてのゲームオブジェクトはデフォルトでアセットの中央を基準に配置される。
描画は `add` を行った順にレイヤーされる。
描画範囲をはみ出したオブジェクトは視覚的に表示されないが存在はしており、シーンそのものは無限のサイズを持っている。

## ステージを作る

以下、とくに断りがない限りシーン内で横断的に使う変数はクラス内のメンバー変数として宣言しているものとする。
デフォルトの設定だとコンストラクターで初期化をしないとtsに怒られる（Phaserでは `create()` 内などで代入をする必要があるため、初期値をここで入れることができない）ため、`"strictPropertyInitialization": false` を指定しておくとよい。

```ts
private platforms: Phaser.Physics.Arcade.StaticGroup
private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
private cursors: Phaser.Types.Input.Keyboard.CursorKeys
private spaceBar: Phaser.Input.Keyboard.Key
```

シーンの `create()` 内に追加していく。

```ts
this.platforms = this.physics.add.staticGroup()

this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
this.platforms.create(600, 400, 'ground')
this.platforms.create(50, 250, 'ground')
this.platforms.create(750, 220, 'ground')
```

`physics` を用いてオブジェクトを追加すると、オブジェクトがPhaser標準の物理エンジン `Arcade Physics` による演算の対象となる。
その名のとおり、往年のアーケードゲームのような2Dアクションゲームに適している。

物理エンジンにはいくつか種類があり、コンフィグで指定可能。

```ts
physics: {
	default: 'arcade',
	arcade: {
		gravity: { x: 0, y: 300 },
		debug: false,
	},
},
```

Arcade Physicsで生成されるオブジェクトには「静的ボディ」と「動的ボディ」がある。

- 静的ボディ: 自身は動けないが、跳ね返りや衝突によって動的ボディに干渉する
- 動的ボディ: 加速度や重力の力によって移動できる

`staticGroup()` は静的ボディを持ったオブジェクトのユニットを作成している。
地面として配置している `setScale(2)` された `ground` オブジェクトは、物理的にも2倍サイズとして扱うために `refreshBody()` を行っている。

## プレイヤーを作って操作する

同様にオブジェクトを作成していく。 `setBounce` はオブジェクトに弾性を与える。 `setCollideWorldBounds` は、レトロゲームによくある「画面外を接触判定とする」機能。

```ts
this.player = this.physics.add.sprite(100, 450, 'dude')

this.player.setBounce(0.2)
this.player.setCollideWorldBounds(true)
```

スプライト画像を用いる場合は `this.load.spritesheet` でスプライトのサイズを指定してアセットを読み込み、 `sprite` として `create` する。

スプライト画像の何コマ目をどのように動かすかを指定し、移動用のアニメーションを作成する。

```ts
this.anims.create({
	key: 'left',
	frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
	frameRate: 10,
	repeat: -1,
})

this.anims.create({
	key: 'turn',
	frames: [{ key: 'dude', frame: 4 }],
	frameRate: 20,
})

this.anims.create({
	key: 'right',
	frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
	frameRate: 10,
	repeat: -1,
})
```

この状態だとまだキャラクターが地面を貫通してしまう。
`collider` によって、キャラクターと地面の接触判定を有効にする。

```ts
this.physics.add.collider(player, platforms)
```

ボタンの初期化もしておく。

```ts
this.cursors = this.input.keyboard!.createCursorKeys()
this.spaceBar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
```

ボタンの初期化ができたら、自動的にポーリング処理を実行してくれる `update()` 内にキーボード操作のコードを書いていく。

```ts
// 左右移動
if (this.cursors.left.isDown) {
	this.player.setVelocityX(-160)
	this.player.anims.play('left', true)
} else if (this.cursors.right.isDown) {
	this.player.setVelocityX(160)
	this.player.anims.play('right', true)
} else {
	this.player.setVelocityX(0)
	this.player.anims.play('turn')
}

// ジャンプ
if (this.spaceBar.isDown && this.player.body.touching.down) {
	this.player.setVelocityY(-330)
}
```

「左移動」「右移動」「静止」の状態は同時に発生しないため `else-if` 文を用いているのがポイント。
ジャンプは `this.player.body.touching.down` で「プレイヤーの下部が接触している（=接地している）」ことを判定しており、ジャンプボタンを長押ししたり空中で連打しても飛距離が増えないようになっている。この条件を渡さなければ無限にホバー移動する。工夫次第で、二段ジャンプやゲージ消費での飛行なども実装できるだろう。


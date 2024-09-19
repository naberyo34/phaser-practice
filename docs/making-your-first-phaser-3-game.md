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
private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
private cursors: Phaser.Types.Input.Keyboard.CursorKeys
```

シーンの `create()` 内に追加していく。

```ts
const platforms = this.physics.add.staticGroup()

platforms.create(400, 568, 'ground').setScale(2).refreshBody()
platforms.create(600, 400, 'ground')
platforms.create(50, 250, 'ground')
platforms.create(750, 220, 'ground')
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
this.cursors = this.input.keyboard!.createCursorKeys() // createCursorKeys で space と shift の初期化もできる
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
if (this.cursors.space.isDown && this.player.body.touching.down) {
	this.player.setVelocityY(-330)
}
```

「左移動」「右移動」「静止」の状態は同時に発生しないため `else-if` 文を用いているのがポイント。
ジャンプは `this.player.body.touching.down` で「プレイヤーの下部が接触している（=接地している）」ことを判定しており、ジャンプボタンを長押ししたり空中で連打しても飛距離が増えないようになっている。この条件を渡さなければ無限にホバー移動する。工夫次第で、二段ジャンプやゲージ消費での飛行なども実装できるだろう。

## アイテムを追加する

TypeScriptで書く場合、多少公式サンプルと異なる書き方をしないと怒られる。

```ts
const stars = this.physics.add.group({
	key: 'star',
	repeat: 11,
	setXY: { x: 12, y: 0, stepX: 70 },
})
stars.children.iterate((child) => {
	;(child as Phaser.Physics.Arcade.Sprite).setBounceY(
		Phaser.Math.FloatBetween(0.4, 0.8),
	)
	return true
})
```

動的ボディを持ったグループを `group` で生成、`repeat` で合計12個生成する。
`iterate` を用いると `forEach` 的にグループの子要素を触ることができる（型がちょっと弱いのでキャストする必要がある）。

```ts
this.physics.add.overlap(this.player, stars, (_player, star) => {
			;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)
		})
```

`overlap()` でキャラクターとアイテムの接触判定を行い、アイテムを非表示にするようにした例。

## スコアを追加する

アイテムを取得したらスコアが加算されるようにしたい。
やること自体はシンプルで、

```ts
private score = 0
```

```ts
const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' })

this.physics.add.overlap(this.player, stars, (_player, star) => {
	;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)
	this.score += 10
	scoreText.setText(`Score: ${this.score}`)
})
```

スコアを変数として保持しておき、画面上に表示しておく。あとは接触判定時に加算すれば簡単に実現できる。

## 敵を追加する

敵といいつつ、ここでは「爆弾」。
アイテムをすべて取得すると1つずつ出現し、当たるとゲームオーバー判定になるオブジェクトを追加していく。

```ts
private gameOver = false
```

```ts
// 爆弾グループ
const bombs = this.physics.add.group()
this.physics.add.collider(bombs, platforms)
this.physics.add.collider(this.player, bombs, (player) => {
	this.physics.pause()
	;(player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).setTint(
		0xff0000,
	)
	;(player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).play(
		'turn',
	)
})
```

```ts
this.physics.add.overlap(this.player, stars, (_player, star) => {
	;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)
	this.score += 10
	scoreText.setText(`Score: ${this.score}`)

	// アイテムをすべて回収した
	if (stars.countActive(true) === 0) {
		// アイテム復活
		stars.children.iterate((child) => {
			;(child as Phaser.Physics.Arcade.Sprite).enableBody(
				true,
				(child as Phaser.Physics.Arcade.Sprite).x,
				0,
				true,
				true,
			)
			return true
		})

		// 爆弾追加
		const x =
			this.player.x < 400
				? Phaser.Math.Between(400, 800)
				: Phaser.Math.Between(0, 400)
		const bomb = bombs.create(x, 16, 'bomb')
		bomb.setBounce(1)
		bomb.setCollideWorldBounds(true)
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
	}
})
```

新しい内容は少なく、わりと愚直に実装していくだけ。
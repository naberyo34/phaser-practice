import { Player } from '../../sprites/Player/Player'

export class Main extends Phaser.Scene {
	constructor() {
		super({ key: 'main', active: false })
	}

	preload() {
		this.load.image('background', 'assets/images/stage/background.png')
		this.load.image('floor', 'assets/images/stage/floor.png')
		this.load.image('sofa', 'assets/images/stage/sofa.png')
		this.load.image('window', 'assets/images/stage/window.png')
		this.load.image('bookshelf', 'assets/images/stage/bookshelf.png')
		this.load.image('tvChan', 'assets/images/stage/tvChan.png')
		this.load.image('trashBox', 'assets/images/stage/trashBox.png')
		this.load.image('grass', 'assets/images/stage/grass.png')
		this.load.image('grass2', 'assets/images/stage/grass2.png')
		this.load.image('table', 'assets/images/stage/table.png')
		this.load.image('bottle', 'assets/images/sprites/bottle.png')
		this.load.image('can', 'assets/images/sprites/can.png')
		this.load.spritesheet('tama', 'assets/images/sprites/tama.png', {
			frameWidth: 64,
			frameHeight: 76,
		})
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private score: number
	private player: Player

	create() {
		this.score = 0
		this.cursors = this.input.keyboard!.createCursorKeys()
		this.add.image(400, 300, 'background')
		const scoreText = this.add.text(16, 16, 'スコア: 0', { fontSize: '32px', fontFamily: 'BestTen-DOT' })

		const stage = this.physics.add.staticGroup()
		stage.create(400, 537, 'floor')

		const bookshelf = this.physics.add.staticSprite(675, 353, 'bookshelf')

		const sofa = this.physics.add.staticSprite(400, 430, 'sofa')
		sofa.setSize(162, 48).setOffset(20, 48)

		const window = this.physics.add.staticSprite(194, 179, 'window')
		window.setSize(332, 14).setOffset(0, 156)

		const tvChan = this.physics.add.staticSprite(723, 197, 'tvChan')
		tvChan.setSize(86, 64).setOffset(0, 14)

		const trashBox = this.physics.add.staticSprite(180, 423, 'trashBox')

		this.physics.add.staticSprite(72, 209, 'grass')
		this.physics.add.staticSprite(124, 208, 'grass2')

		this.player = new Player(this, 40, 440, 'tama', this.cursors)

		// 以下、プレイヤーより手前に表示する

		

		const garbages = this.physics.add.group()
		const bottle: Phaser.Physics.Arcade.Sprite = garbages.create(
			Phaser.Math.Between(0, 800),
			16,
			'bottle',
		)
		bottle.setCollideWorldBounds(true)
		bottle.setVelocity(Phaser.Math.Between(-400, 400), 20)
		const can: Phaser.Physics.Arcade.Sprite = garbages.create(
			Phaser.Math.Between(0, 800),
			16,
			'can',
		)
		can.setCollideWorldBounds(true)
		can.setVelocity(Phaser.Math.Between(-400, 400), 20)

		this.physics.add.staticSprite(400, 454, 'table')

		// 接触判定
		this.physics.add.collider(this.player, stage)
		this.physics.add.collider(this.player, bookshelf, undefined, (player) => {
			if (this.cursors.down.isDown) {
				return false
			}
			return (
				(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
					.y > 0
			)
		})
		this.physics.add.collider(
			this.player,
			sofa,
			() => {
				// 上から乗ったときに大ジャンプする
				this.player.setVelocityY(-640)
			},
			(player) => {
				// 空中からの落下中のみ反応する
				return (
					(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body
						.velocity.y > 0
				)
			},
		)
		this.physics.add.collider(this.player, window, undefined, (player) => {
			if (this.cursors.down.isDown) {
				return false
			}
			return (
				(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
					.y > 0
			)
		})
		this.physics.add.collider(this.player, tvChan)
		this.physics.add.collider(garbages, stage)
	}

	update() {
		this.player.update()
	}
}

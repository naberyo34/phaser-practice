import { Garbage } from '../../sprites/Garbage/Garbage'
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
	private keyZ: Phaser.Input.Keyboard.Key
	private score = 0
	private player: Player
	private garbages: Phaser.Physics.Arcade.Group
	
	create() {
		// 初期化
		this.cursors = this.input.keyboard!.createCursorKeys()
		this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)

		// オブジェクト配置
		this.add.image(400, 300, 'background')

		const scoreText = this.add.text(16, 16, 'スコア: 0')

		const stage = this.physics.add.staticGroup()
		stage.create(400, 537, 'floor')

		const bookshelf = this.physics.add.staticSprite(675, 353, 'bookshelf')

		const sofa = this.physics.add.staticSprite(400, 430, 'sofa')
		sofa.setSize(162, 48).setOffset(20, 48)

		const window = this.physics.add.staticSprite(194, 179, 'window')
		window.setSize(332, 14).setOffset(0, 156)

		const tvChan = this.physics.add.staticSprite(723, 197, 'tvChan')
		tvChan.setSize(86, 64).setOffset(0, 14)

		this.physics.add.staticSprite(72, 209, 'grass')
		this.physics.add.staticSprite(124, 208, 'grass2')

		const trashBox = this.physics.add.staticSprite(180, 423, 'trashBox')
		trashBox.setSize(180, 80).setOffset(0, 0)

		this.player = new Player(this, 40, 440, 'tama', this.cursors, this.keyZ)

		this.garbages = this.physics.add.group()

		for (let i = 0; i < 20; i++) {
			this.garbages.add(
				new Garbage(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 400),
					'can',
				),
			)
		}

		for (let i = 0; i < 10; i++) {
			this.garbages.add(
				new Garbage(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 400),
					'bottle',
				),
			)
		}

		this.garbages.children.iterate((garbage) => {
			;(garbage as Garbage).setCollideWorldBounds()
			return true
		})

		// 接触判定
		this.physics.add.collider(this.player, stage)
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
		this.physics.add.collider(this.player, bookshelf, undefined, (player) => {
			if (this.cursors.down.isDown) {
				return false
			}
			return (
				(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
					.y > 0
			)
		})
		this.physics.add.collider(this.player, tvChan)

		this.physics.add.collider(this.garbages, this.garbages)
		this.physics.add.collider(this.garbages, stage)
		this.physics.add.collider(this.garbages, window)
		this.physics.add.collider(this.garbages, bookshelf)
		this.physics.add.collider(this.garbages, tvChan)
		this.physics.add.overlap(this.garbages, trashBox, (garbage, _) => {
			;(garbage as Garbage).disableBody(true, true)
			this.score += 10
			scoreText.setText(`Score: ${this.score}`)
		})
	}

	update() {
		this.player.update()

		// プレイヤーに近接しているゴミがあるか判定する
		let nearObject: Garbage | undefined = undefined
		this.garbages.children.iterate((garbage) => {
			const isNear =
				Phaser.Math.Distance.Between(
					(garbage as Garbage).x,
					(garbage as Garbage).y,
					this.player.x,
					this.player.y,
				) < 30
			;(garbage as Garbage).setNear(isNear)
			if (isNear) {
				nearObject = garbage as Garbage
				return false
			}
			return true
		})
		this.player.setNearObject(nearObject)
	}
}

import { Player } from '../../sprites/Player/Player'

export class Main extends Phaser.Scene {
	constructor() {
		super({ key: 'main', active: false })
	}

	preload() {
		this.load.image('background', 'assets/stage/background.png')
		this.load.image('floor', 'assets/stage/floor.png')
		this.load.image('sofa', 'assets/stage/sofa.png')
		this.load.image('bookshelf', 'assets/stage/bookshelf.png')
		this.load.image('bottle', 'assets/bottle.png')
		this.load.image('can', 'assets/can.png')
		this.load.spritesheet('tama', 'assets/tama.png', {
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
		const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' })

		// 当たり判定を調整しなくてよいステージオブジェクトはここに入れる
		const stage = this.physics.add.staticGroup()
		stage.create(400, 537, 'floor')
		stage.create(670, 353, 'bookshelf')

		const sofa = this.physics.add.staticSprite(300, 429, 'sofa')
		sofa.setSize(162, 48).setOffset(20, 48)

		this.player = new Player(this, 100, 200, 'tama', this.cursors)

		const stars = this.physics.add.group()
		const star = stars.create(Phaser.Math.Between(0, 800), 16, 'bottle')
		star.setBounce(1)
		star.setCollideWorldBounds(true)
		star.setVelocity(Phaser.Math.Between(-400, 400), 20)
		const bombs = this.physics.add.group()

		/**
		 * 星を取得したときの処理
		 */
		const collectStar = (
			star:
				| Phaser.Physics.Arcade.Body
				| Phaser.Tilemaps.Tile
				| Phaser.Types.Physics.Arcade.GameObjectWithBody,
		) => {
			;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)
			this.score += 10
			scoreText.setText(`score: ${this.score}`)

			// アイテムをすべて回収したら
			if (stars.countActive(true) === 0) {
				// アイテム復活
				stars.children.iterate((child) => {
					const star = child as Phaser.Physics.Arcade.Sprite
					star.enableBody(true, Phaser.Math.Between(0, 800), 0, true, true)
					star.setVelocity(Phaser.Math.Between(-400, 400), 20)
					return true
				})

				// 爆弾追加
				const bomb = bombs.create(Phaser.Math.Between(0, 800), 16, 'can')
				bomb.setBounce(1)
				bomb.setCollideWorldBounds(true)
				bomb.setVelocity(Phaser.Math.Between(-400, 400), 20)
			}
		}

		/**
		 * ゲームオーバー時の処理
		 */
		const gameOver = () => {
			this.physics.pause()
			this.player.dead()
			this.add
				.text(400, 200, 'you died', { fontSize: '64px', color: '#f00' })
				.setOrigin(0.5, 0.5)
			this.time.delayedCall(2000, () => {
				if (this.score > this.registry.get('highScore')) {
					this.registry.set('highScore', this.score)
				}
				this.scene.start('title')
			})
		}

		// 接触判定
		this.physics.add.collider(this.player, stage)
		this.physics.add.collider(this.player, sofa)
		this.physics.add.collider(stars, stage)
		this.physics.add.collider(bombs, stage)
		this.physics.add.collider(this.player, stars, (_player, star) => {
			collectStar(star)
		})
		this.physics.add.collider(this.player, bombs, gameOver)
	}

	update() {
		this.player.update()
	}
}

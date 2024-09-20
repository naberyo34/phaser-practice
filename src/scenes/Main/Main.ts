import { Player } from '../../sprites/Player/Player'

export class Main extends Phaser.Scene {
	constructor() {
		super({ key: 'main', active: false })
	}

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

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private score: number
	private player: Player

	create() {
		this.score = 0
		this.cursors = this.input.keyboard!.createCursorKeys()
		this.add.image(400, 300, 'sky')
		this.player = new Player(this, 100, 450, 'dude', this.cursors)
		const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' })

		const platforms = this.physics.add.staticGroup()
		platforms.create(400, 568, 'ground').setScale(2).refreshBody()
		platforms.create(600, 400, 'ground')
		platforms.create(50, 250, 'ground')
		platforms.create(750, 220, 'ground')

		const stars = this.physics.add.group()
		const star = stars.create(Phaser.Math.Between(0, 800), 16, 'star')
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
				const bomb = bombs.create(Phaser.Math.Between(0, 800), 16, 'bomb')
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
		this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(stars, platforms)
		this.physics.add.collider(bombs, platforms)
		this.physics.add.collider(this.player, stars, (_player, star) => {
			collectStar(star)
		})
		this.physics.add.collider(this.player, bombs, gameOver)
	}

	update() {
		this.player.update()
	}
}

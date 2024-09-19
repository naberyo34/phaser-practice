export class Title extends Phaser.Scene {
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

	private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private score = 0

	create() {
		// 背景
		this.add.image(400, 300, 'sky')

		// プレイヤー
		this.player = this.physics.add.sprite(100, 450, 'dude')
		this.player.setBounce(0.2)
		this.player.setCollideWorldBounds(true)
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

		// キーボード設定
		this.cursors = this.input.keyboard!.createCursorKeys()

		// スコア表示
		const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' })

		// 地面
		const platforms = this.physics.add.staticGroup()
		platforms.create(400, 568, 'ground').setScale(2).refreshBody()
		platforms.create(600, 400, 'ground')
		platforms.create(50, 250, 'ground')
		platforms.create(750, 220, 'ground')

		// 星アイテム
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
		this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(stars, platforms)

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
	}

	update() {
		// 左右移動
		const isDashed = this.cursors.shift.isDown && this.player.body.touching.down
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(isDashed ? -320 : -160)
			this.player.anims.play('left', true)
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(isDashed ? 320 : 160)
			this.player.anims.play('right', true)
		} else {
			this.player.setVelocityX(0)
			this.player.anims.play('turn')
		}

		// ジャンプ
		if (this.cursors.space.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-330)
		}
	}
}

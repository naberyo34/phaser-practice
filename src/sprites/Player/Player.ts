export class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		cursors: Phaser.Types.Input.Keyboard.CursorKeys,
	) {
		super(scene, x, y, texture)
		this.cursors = cursors

		scene.add.existing(this)
		scene.physics.world.enable(this)

		this.setCollideWorldBounds(true)

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
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private isDead = false

	dead() {
		this.isDead = true
		this.setTint(0xff0000)
		this.play('turn')
	}

	update() {
    if (this.isDead) {
      return
    }

		// 左右移動
		if (this.cursors.left.isDown) {
			this.setVelocityX(-320)
			this.anims.play('left', true)
		} else if (this.cursors.right.isDown) {
			this.setVelocityX(320)
			this.anims.play('right', true)
		} else {
			this.setVelocityX(0)
			this.anims.play('turn')
		}

		// ジャンプ
		if (this.cursors.space.isDown && this.body!.touching.down) {
			this.setVelocityY(-330)
		}
	}
}

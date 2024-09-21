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
			key: 'jump',
			frames: [{ key: 'tama', frame: 0 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNumbers('tama', { start: 1, end: 4 }),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'stand',
			frames: [{ key: 'tama', frame: 5 }],
			frameRate: 20,
		})
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private isDead = false
	private isFlip = true

	dead() {
		this.isDead = true
		this.setRotation(90)
		this.setTint(0xff0000)
		this.play('centerStand').flipY
	}

	update() {
		if (this.isDead) {
			return
		}

		this.flipX = this.isFlip

		// 左右移動
		if (this.cursors.left.isDown) {
			this.isFlip = false
			this.setVelocityX(-320)
			this.play(this.body!.touching.down ? 'walk' : 'jump', true)
		} else if (this.cursors.right.isDown) {
			this.isFlip = true
			this.setVelocityX(320)
			this.play(this.body!.touching.down ? 'walk' : 'jump', true)
		} else {
			this.setVelocityX(0)
			this.play(this.body!.touching.down ? 'stand' : 'jump', true)
		}

		// ジャンプ
		if (this.cursors.space.isDown && this.body!.touching.down) {
			this.setVelocityY(-320)
		}
	}
}

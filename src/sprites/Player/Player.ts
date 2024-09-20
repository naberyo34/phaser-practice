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
			key: 'leftStand',
			frames: [{ key: 'dude', frame: 5 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'centerStand',
			frames: [{ key: 'dude', frame: 6 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'rightStand',
			frames: [{ key: 'dude', frame: 7 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'leftJump',
			frames: [{ key: 'dude', frame: 0 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'rightJump',
			frames: [{ key: 'dude', frame: 12 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 4 }),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('dude', { start: 8, end: 11 }),
			frameRate: 10,
			repeat: -1,
		})
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private isDead = false
	private currentDirection: 'right' | 'left' = 'right'

	dead() {
		this.isDead = true
		this.setTint(0xff0000)
		this.play('centerStand')
	}

	update() {
		if (this.isDead) {
			return
		}

		// 左右移動
		if (this.cursors.left.isDown) {
			if (this.currentDirection === 'right') {
				this.currentDirection = 'left'
			}
			this.setVelocityX(-320)
			this.body!.touching.down
				? this.play('left', true)
				: this.play('leftJump', true)
		} else if (this.cursors.right.isDown) {
			if (this.currentDirection === 'left') {
				this.currentDirection = 'right'
			}
			this.setVelocityX(320)
			this.body!.touching.down
				? this.play('right', true)
				: this.play('rightJump', true)
		} else {
			this.setVelocityX(0)
			if (this.currentDirection === 'left') {
				this.body!.touching.down
					? this.play('leftStand', true)
					: this.play('leftJump', true)
			} else {
				this.body!.touching.down
					? this.play('rightStand', true)
					: this.play('rightJump', true)
			}
		}

		// ジャンプ
		if (this.cursors.space.isDown && this.body!.touching.down) {
			this.setVelocityY(-330)
		}
	}
}

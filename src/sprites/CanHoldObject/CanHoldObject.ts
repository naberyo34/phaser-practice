export class CanHoldObject extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		sound:
			| Phaser.Sound.NoAudioSoundManager
			| Phaser.Sound.HTML5AudioSoundManager
			| Phaser.Sound.WebAudioSoundManager,
		point: number,
	) {
		super(scene, x, y, texture)
		this.sound = sound
		this.boundSound = this.sound.add('bound')
		this.point = point

		scene.add.existing(this)
		scene.physics.world.enable(this)
		this.setAngle(Phaser.Math.Between(0, 360))
	}

	private sound:
		| Phaser.Sound.NoAudioSoundManager
		| Phaser.Sound.HTML5AudioSoundManager
		| Phaser.Sound.WebAudioSoundManager

	private boundSound:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.WebAudioSound

	/**
	 * 得点
	 */
	private point = 0
	getPoint() {
		return this.point
	}

	/**
	 * このオブジェクトがあるオブジェクトに近接しているか。
	 * setNear によってのみ更新される。
	 */
	private isNear = false
	setNear(isNear: boolean) {
		this.isNear = isNear
		if (this.isNear) {
			this.setTint(0xff0000)
		} else {
			this.clearTint()
		}
	}

	/**
	 * このオブジェクトがプレイヤーによって投げられたか。
	 * setThrowed によってのみ更新される。
	 */
	private isThrowed = false
	getThrowed() {
		return this.isThrowed
	}
	setThrowed(isThrowed: boolean) {
		this.isThrowed = isThrowed
	}

	update() {
		if (!this.active) {
			return
		}

		this.setBounce(this.isThrowed ? 0.8 : 0)

		const blocked =
			this.body!.blocked.up ||
			this.body!.blocked.right ||
			this.body!.blocked.down ||
			this.body!.blocked.left

		// 投げられたオブジェクトが跳ね返るとき、SEを鳴らす
		if (
			this.isThrowed &&
			this.body!.wasTouching.none &&
			blocked &&
			!this.boundSound.isPlaying
		) {
			this.boundSound.play()
		}
	}
}

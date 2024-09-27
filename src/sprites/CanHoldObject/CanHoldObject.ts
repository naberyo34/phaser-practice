export type ObjectType = 'wastepaper' | 'can' | 'bottle' | 'garbageBag'
export type ObjectCategory = 'burnable' | 'unburnable' | 'treasure'

const objectData: Record<
	ObjectType,
	{ category: ObjectCategory; point: number }
> = {
	wastepaper: { category: 'burnable', point: 10 },
	can: { category: 'unburnable', point: 20 },
	bottle: { category: 'unburnable', point: 30 },
	garbageBag: { category: 'burnable', point: 50 },
}

/**
 * 「つかむ」「なげる」操作が可能なオブジェクト全般
 */
export class CanHoldObject extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: ObjectType,
		sound:
			| Phaser.Sound.NoAudioSoundManager
			| Phaser.Sound.HTML5AudioSoundManager
			| Phaser.Sound.WebAudioSoundManager,
	) {
		super(scene, x, y, texture)
		this.sound = sound
		this.boundSound = this.sound.add('bound')
		this.objectType = texture
		this.objectCategory = objectData[this.objectType].category
		this.point = objectData[this.objectType].point
		this.isNear = false
		this.isThrowed = false

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
	 * このオブジェクトの種類。
	 * texture の key と同じ文字列が与えられる。
	 */
	private objectType: ObjectType
	getObjectType() {
		return this.objectType
	}

	/**
	 * 燃えるゴミ、燃えないゴミ、おたから
	 */
	private objectCategory: ObjectCategory
	getObjectCategory() {
		return this.objectCategory
	}

	/**
	 * 得点
	 */
	private point: number
	getPoint() {
		return this.point
	}

	/**
	 * このオブジェクトがあるオブジェクトに近接しているか。
	 * setNear によってのみ更新される。
	 */
	private isNear: boolean
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
	private isThrowed
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

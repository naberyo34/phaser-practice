import type { CanHoldObject } from '../CanHoldObject/CanHoldObject'

/**
 * プレイヤーが操作するキャラクター
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		sound:
			| Phaser.Sound.NoAudioSoundManager
			| Phaser.Sound.HTML5AudioSoundManager
			| Phaser.Sound.WebAudioSoundManager,
		cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		keyZ: Phaser.Input.Keyboard.Key,
	) {
		super(scene, x, y, texture)
		this.sound = sound
		this.cursors = cursors
		this.keyZ = keyZ

		scene.add.existing(this)
		scene.physics.world.enable(this)

		this.setCollideWorldBounds(true).setGravityY(600)

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
		this.anims.create({
			key: 'jumpHold',
			frames: [{ key: 'tama', frame: 6 }],
			frameRate: 20,
		})
		this.anims.create({
			key: 'walkHold',
			frames: this.anims.generateFrameNumbers('tama', { start: 7, end: 10 }),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'standHold',
			frames: [{ key: 'tama', frame: 11 }],
			frameRate: 20,
		})
	}

	private sound:
		| Phaser.Sound.NoAudioSoundManager
		| Phaser.Sound.HTML5AudioSoundManager
		| Phaser.Sound.WebAudioSoundManager
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private keyZ: Phaser.Input.Keyboard.Key

	/**
	 * スプライトを反転するか。
	 * キャラクターが画面右側を向いているときに true となる。
	 */
	private isFlip = true
	/**
	 * プレイヤーに近接しているオブジェクト。
	 * 外部からの set によってのみ更新される。
	 */
	private nearObject: CanHoldObject | undefined
	/**
	 * プレイヤーがつかんでいるオブジェクト。
	 */
	private holdObject: CanHoldObject | undefined

	/**
	 * 近接しているオブジェクトを設定する
	 */
	setNearObject(target: CanHoldObject | undefined) {
		this.nearObject = target
	}

	/**
	 * 近接しているオブジェクトを「つかむ」
	 */
	hold() {
		if (this.nearObject) {
			this.sound.play('hold')
			this.holdObject = this.nearObject
			this.holdObject.disableBody()
		}
	}

	/**
	 * 近接しているオブジェクトを「なげる」
	 */
	throw(direction: { x: number; y: number }) {
		if (this.holdObject) {
			this.sound.play('throw')
			this.holdObject.setThrowed(true)
			this.holdObject.enableBody()
			this.holdObject.setVelocity(direction.x, direction.y || -200)
			this.holdObject = undefined
		}
	}

	update() {
		this.flipX = this.isFlip

		// 「つかむ」状態のときは立ち絵を変える
		const move = (() => {
			if (this.holdObject) {
				return this.body!.touching.down ? 'walkHold' : 'jumpHold'
			}
			return this.body!.touching.down ? 'walk' : 'jump'
		})()

		const stay = (() => {
			if (this.holdObject) {
				return this.body!.touching.down ? 'standHold' : 'jumpHold'
			}
			return this.body!.touching.down ? 'stand' : 'jump'
		})()

		// 左右移動
		if (this.cursors.left.isDown) {
			this.isFlip = false
			this.setVelocityX(-320)
			this.play(move, true)
		} else if (this.cursors.right.isDown) {
			this.isFlip = true
			this.setVelocityX(320)
			this.play(move, true)
		} else {
			this.setVelocityX(0)
			this.play(stay, true)
		}

		// ジャンプ
		if (this.cursors.space.isDown && this.body!.touching.down) {
			this.sound.play('jump')
			this.setVelocityY(-320)
		}

		// つかんでいるオブジェクトを追従させる
		if (this.holdObject) {
			this.holdObject.x = this.x + (this.isFlip ? 30 : -30)
			this.holdObject.y = this.y + 10
		}

		// つかむ
		if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
			if (!this.holdObject && this.nearObject) {
				this.hold()
			}
		}

		// なげる
		if (this.keyZ.isUp) {
			if (this.holdObject) {
				// 投げる方向
				const direction = (() => {
					const result = { x: 0, y: 0 }
					if (this.cursors.up.isDown) {
						result.y = -400
					}

					if (this.cursors.right.isDown) {
						result.x = 400
					}

					if (this.cursors.down.isDown) {
						result.y = 400
					}

					if (this.cursors.left.isDown) {
						result.x = -400
					}
					return result
				})()
				this.throw(direction)
			}
		}
	}
}

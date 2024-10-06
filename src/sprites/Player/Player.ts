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
		this.jumpTimer = 0
		this.lastTimePressDownKey = 0
		this.isJumpDown = false

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
	getIsHold() {
		return !!this.holdObject
	}

	/**
	 * ジャンプを開始した瞬間のゲーム内時間。
	 * 小ジャンプ / 大ジャンプを押し分けるために用いる。
	 */
	private jumpTimer: number

	/**
	 * 最後に下キーを押した時間。
	 * 下キーを2連入力したかの判定に用いる。
	 */
	private lastTimePressDownKey: number

	/**
	 * このフラグが立っている間、プレイヤーは「降りられる段差」に対して接触判定がなくなる。
	 * 下キーを2連入力した際に一時的に立つ。
	 */
	private isJumpDown: boolean
	getIsJumpDown() {
		return this.isJumpDown
	}

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

			// その場で手放したとき以外は回転アニメーションを入れる
			if (Math.abs(direction.x) > 0 || Math.abs(direction.y) > 100) {
				this.scene.tweens.add({
					targets: this.holdObject,
					duration: Phaser.Math.Between(800, 1600),
					angle: Phaser.Math.Between(360, 1440),
				})
			}

			this.holdObject.setIsThrowed(true)
			this.holdObject.enableBody()
			this.holdObject.setVelocity(direction.x, direction.y)
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

		// 下キーの2連入力判定
		if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
			const elapsedTime = this.scene.time.now - this.lastTimePressDownKey
			if (elapsedTime < 200) {
				this.isJumpDown = true

				this.scene.time.delayedCall(200, () => {
					this.isJumpDown = false
				})
			}
			this.lastTimePressDownKey = this.scene.time.now
		}

		// ジャンプ
		if (this.cursors.space.isDown) {
			// ジャンプ開始
			if (this.body!.touching.down) {
				this.sound.play('jump')
				// 小ジャンプ
				this.setVelocityY(-100)
				this.jumpTimer = this.scene.time.now
			} else {
				// 長めに入力した場合ジャンプ飛距離を伸ばす
				const jumpLength = this.scene.time.now - this.jumpTimer
				if (200 > jumpLength) {
					this.setVelocityY(-300)
				}
			}
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
					if (this.cursors.left.isDown) {
						result.x = -400
					}
					if (this.cursors.right.isDown) {
						result.x = 400
					}
					if (this.cursors.up.isDown) {
						result.y = -400
					}
					if (this.cursors.down.isDown) {
						result.y = 400
					}
					// 上下入力をしていない場合はちょっと上向きに飛ばす
					if (result.y === 0) {
						result.y = -100
					}
					return result
				})()
				this.throw(direction)
			}
		}
	}
}

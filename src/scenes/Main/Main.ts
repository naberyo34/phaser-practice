import {
	CanHoldObject,
	type ObjectType,
} from '../../sprites/CanHoldObject/CanHoldObject'
import { Player } from '../../sprites/Player/Player'
import { defaultFontStyle, pointFontStyle } from '../../utils/fontStyle'

export class Main extends Phaser.Scene {
	constructor() {
		super({ key: 'main', active: false })
	}

	private isGameOver: boolean
	private isGameEnd: boolean
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private keyZ: Phaser.Input.Keyboard.Key
	private timer: Phaser.Time.TimerEvent
	private timerCount: number
	private timerText: Phaser.GameObjects.Text
	private bgm:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.WebAudioSound

	private player: Player
	private garbages: Phaser.Physics.Arcade.Group

	private score: number
	private objectCount: Record<ObjectType, { label: string; count: number }>

	init() {
		this.isGameOver = false
		this.isGameEnd = false
		this.cursors = this.input.keyboard!.createCursorKeys()
		this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
		this.timer = this.time.addEvent({
			delay: 1000,
			callback: this.countDown,
			callbackScope: this,
			loop: true,
		})
		this.timerCount = 5
		this.score = 0
		this.objectCount = {
			wastepaper: { label: '紙くず', count: 0 },
			can: { label: '缶', count: 0 },
			bottle: { label: 'ペットボトル', count: 0 },
			garbageBag: { label: 'ゴミ袋', count: 0 },
		}

		this.physics.resume()
	}

	preload() {
		// Image
		this.load.image('background', 'assets/images/stage/background.png')
		this.load.image('floor', 'assets/images/stage/floor.png')
		this.load.image('window', 'assets/images/stage/window.png')
		this.load.image('lamp', 'assets/images/stage/lamp.png')
		this.load.image('shelf', 'assets/images/stage/shelf.png')
		this.load.image('shelf2', 'assets/images/stage/shelf2.png')
		this.load.image('box', 'assets/images/stage/box.png')
		this.load.image('box2', 'assets/images/stage/box2.png')
		this.load.image('trashBox', 'assets/images/stage/trashBox.png')
		this.load.image('trashBox2', 'assets/images/stage/trashBox2.png')
		this.load.image('sofa', 'assets/images/stage/sofa.png')
		this.load.image('base', 'assets/images/stage/base.png')
		this.load.image('tvChan', 'assets/images/stage/tvChan.png')
		this.load.image('grass', 'assets/images/stage/grass.png')
		this.load.image('grass2', 'assets/images/stage/grass2.png')
		this.load.image('wastepaper', 'assets/images/sprites/wastepaper.png')
		this.load.image('garbageBag', 'assets/images/sprites/garbageBag.png')
		this.load.image('bottle', 'assets/images/sprites/bottle.png')
		this.load.image('can', 'assets/images/sprites/can.png')
		this.load.spritesheet('tama', 'assets/images/sprites/tama.png', {
			frameWidth: 58,
			frameHeight: 76,
		})

		// Sound
		this.load.audio('bgm', 'assets/sounds/music/test.mp3')
		this.load.audio('gameOver', 'assets/sounds/music/test2.mp3')
		this.load.audio('jump', 'assets/sounds/se/jump.mp3')
		this.load.audio('jumpLong', 'assets/sounds/se/jumpLong.mp3')
		this.load.audio('hold', 'assets/sounds/se/hold.mp3')
		this.load.audio('throw', 'assets/sounds/se/throw.mp3')
		this.load.audio('shoot', 'assets/sounds/se/shoot.mp3')
		this.load.audio('bound', 'assets/sounds/se/bound.mp3')
		this.load.audio('timeUp', 'assets/sounds/se/timeUp.mp3')
	}

	create() {
		// サウンド
		this.sound.pauseAll()
		this.bgm = this.sound.add('bgm')
		this.bgm.setLoop(true)
		this.bgm.play()

		// オブジェクト
		this.add.image(400, 300, 'background')

		// 下キーで降りることができるオブジェクト
		const canLeaveObjects = this.physics.add.staticGroup()
		canLeaveObjects.create(81, 192, 'base')
		canLeaveObjects.create(720, 192, 'base')
		canLeaveObjects
			.create(400, 211, 'window')
			.setSize(244, 16)
			.setOffset(0, 126)
		canLeaveObjects.create(109, 474, 'shelf')
		canLeaveObjects.create(720, 447, 'shelf2')

		// 常に接触するオブジェクト
		const staticObjects = this.physics.add.staticGroup()
		staticObjects.create(400, 572, 'floor')
		staticObjects.create(78, 381, 'box')
		staticObjects.create(115, 341, 'box2')
		staticObjects.create(757, 319, 'tvChan').setSize(86, 64).setOffset(0, 14)

		// その他のオブジェクト
		const sofa = this.physics.add
			.staticSprite(400, 498, 'sofa')
			.setSize(162, 48)
			.setOffset(20, 48)
		const trashBox = this.physics.add.staticSprite(258, 515, 'trashBox')
		const trashBox2 = this.physics.add.staticSprite(552, 515, 'trashBox2')

		this.player = new Player(
			this,
			40,
			440,
			'tama',
			this.sound,
			this.cursors,
			this.keyZ,
		)

		this.garbages = this.physics.add.group()
		for (let i = 0; i < 80; i++) {
			const random = ((): ObjectType => {
				const int = Phaser.Math.Between(1, 100)
				// 40%
				if (int <= 40) {
					return 'wastepaper'
				}
				// 30%
				if (int <= 70) {
					return 'can'
				}
				// 20%
				if (int <= 90) {
					return 'bottle'
				}
				// 10%
				return 'garbageBag'
			})()
			this.garbages.add(
				new CanHoldObject(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 500),
					random,
					this.sound,
				),
			)
		}
		this.garbages.children.iterate((garbage) => {
			;(garbage as CanHoldObject).setCollideWorldBounds().setBounce(0.5)
			return true
		})

		this.timerText = this.add
			.text(400, 64, '30', {
				...defaultFontStyle,
				fontSize: '48px',
			})
			.setOrigin(0.5, 0.5)

		// 接触判定
		this.physics.add.collider(this.player, staticObjects)
		this.physics.add.collider(
			this.player,
			canLeaveObjects,
			undefined,
			(player) => {
				if (!this.player.getIsHold() && this.cursors.down.isDown) {
					return false
				}
				return (
					(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body
						.velocity.y > 0
				)
			},
		)
		this.physics.add.collider(
			this.player,
			sofa,
			() => {
				// ジャンプキーを押しているときは通常のジャンプを優先する
				if (this.cursors.space.isDown) {
					return
				}
				// 上から乗ったときに大ジャンプする
				this.sound.play('jumpLong')
				this.player.setVelocityY(-800)
			},
			(player) => {
				// 空中からの落下中のみ反応する
				return (
					(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body
						.velocity.y > 0
				)
			},
		)

		this.physics.add.collider(this.garbages, staticObjects)
		this.physics.add.collider(this.garbages, canLeaveObjects)
		this.physics.add.collider(this.garbages, this.garbages)

		this.physics.add.overlap(trashBox, this.garbages, (trashBox, garbage) => {
			this.trash(
				garbage as CanHoldObject,
				trashBox as Phaser.Types.Physics.Arcade.GameObjectWithBody,
				'burnable',
			)
		})

		this.physics.add.overlap(trashBox2, this.garbages, (trashBox, garbage) => {
			this.trash(
				garbage as CanHoldObject,
				trashBox as Phaser.Types.Physics.Arcade.GameObjectWithBody,
				'unburnable',
			)
		})
	}

	update() {
		// 最終画面に到達したら終了時メニューを操作可能にする
		if (this.isGameEnd) {
			if (this.cursors.space.isDown) {
				this.scene.start('title')
			}
			return
		}

		// タイムアップしたら操作不能にする
		if (this.isGameOver) {
			return
		}

		// カウントダウン
		this.timerText.setText(this.timerCount.toString())
		if (this.timerCount === 0) {
			this.gameOver()
		}

		this.player.update()
		this.checkNearObject()
	}

	/**
	 * プレイヤーに近接しているオブジェクトがあるか判定する
	 */
	checkNearObject() {
		let nearObject: CanHoldObject | undefined = undefined
		this.garbages.children.iterate((_garbage) => {
			const garbage = _garbage as CanHoldObject
			garbage.update()

			if (!garbage.active) {
				return true
			}

			// 画面端のオブジェクトが選択不可能にならないよう、端にある場合は近接判定を広くする
			const isEdge = garbage.x <= 20 || garbage.x >= 780
			const isNear =
				Phaser.Math.Distance.Between(
					garbage.x,
					garbage.y,
					this.player.x,
					this.player.y,
				) < (isEdge ? 50 : 40)
			garbage.setNear(isNear)
			if (isNear) {
				nearObject = garbage
				return false
			}
			return true
		})
		this.player.setNearObject(nearObject)
	}

	/**
	 * ゴミ捨て
	 */
	trash(
		garbage: CanHoldObject,
		trashBox: Phaser.Types.Physics.Arcade.GameObjectWithBody,
		trashBoxCategory: 'burnable' | 'unburnable',
	) {
		// プレイヤーによって投げられて overlap したとき以外は無視
		if (!garbage.getThrowed()) {
			return
		}

		this.sound.play('shoot')
		this.tweens.add({
			targets: trashBox,
			duration: 80,
			repeat: 0,
			yoyo: true,
			scale: 1.2,
		})
		garbage.disableBody(true, true)

		// 正しく分別されていたらアイテムごとのポイント、間違えていたら1ptを獲得
		const point =
			garbage.getObjectCategory() === trashBoxCategory ? garbage.getPoint() : 1
		const scoreX = trashBox.body.x + 20
		const scoreY = trashBox.body.y
		const score = this.add.text(scoreX, scoreY, `+${point}pt`, {
			...pointFontStyle(point),
		})
		this.tweens.add({
			targets: score,
			ease: 'Sine.easeInOut',
			duration: 800,
			repeat: 0,
			y: scoreY - 40,
			alpha: 0,
			onComplete: () => {
				score.destroy(true)
			},
		})
		this.score += point
		this.objectCount[garbage.getObjectType()].count++
	}

	/**
	 * カウントダウン
	 * 1秒ごとに呼ばれる想定。0秒になったらタイマーを破棄する。
	 */
	countDown() {
		this.timerCount -= 1
		if (this.timerCount === 0) {
			this.timer.destroy()
		}
	}

	/**
	 * ゲームオーバー
	 * タイムアップしたときに呼ばれる想定。キャラクターの操作を停止し、結果発表を行う。
	 * 結果発表が終了したら gameEnd に移行する。
	 */
	gameOver() {
		this.isGameOver = true
		this.physics.pause()
		this.sound.pauseAll()
		this.sound.play('timeUp')

		// ハイスコアを達成していたらローカルストレージに書き込んでおく
		if (
			this.score > Number.parseInt(localStorage.getItem('highScore') ?? '0')
		) {
			localStorage.setItem('highScore', this.score.toString())
		}

		const timeUpText = this.add
			.text(400, 300, 'そこまで！', {
				...defaultFontStyle,
				fontSize: '64px',
				strokeThickness: 12,
				shadow: {
					...defaultFontStyle.shadow,
					offsetY: 8,
				},
			})
			.setOrigin(0.5, 0.5)
			.setScale(0.5)
		this.tweens.add({
			targets: timeUpText,
			ease: 'Sine.easeInOut',
			duration: 80,
			repeat: 0,
			scale: 1,
		})

		// 捨てたゴミの数と合計スコアを発表する
		this.time.delayedCall(2000, () => {
			this.timerText.destroy(true)
			timeUpText.destroy(true)
			this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.5)
			this.add
				.text(400, 80, '結果発表', {
					...defaultFontStyle,
					fontSize: '48px',
				})
				.setOrigin(0.5, 0.5)
			const objectCountKeys = Object.keys(this.objectCount) as ObjectType[]
			objectCountKeys.forEach((key, index) => {
				this.time.delayedCall(500 * index, () => {
					this.sound.play('shoot')
					this.add
						.text(
							400,
							180 + 60 * index,
							`${this.objectCount[key].label} ... x${this.objectCount[key].count}`,
							{
								...defaultFontStyle,
							},
						)
						.setOrigin(0.5, 0.5)
				})

				if (index + 1 === objectCountKeys.length) {
					this.time.delayedCall(500 * (index + 1), () => {
						this.sound.play('shoot')
						this.add
							.text(400, 220 + 60 * (index + 1), `スコア ${this.score}pt`, {
								...defaultFontStyle,
								fontSize: '48px',
							})
							.setOrigin(0.5, 0.5)
					})
				}
			})

			// gameEnd に移行
			this.time.delayedCall(1000 + objectCountKeys.length * 500, () => {
				this.gameEnd()
			})
		})
	}

	/**
	 * ゲーム終了
	 * 結果発表の終了後、プレイヤーがメニューを操作可能にする。
	 * TODO: タイトルに戻る、もう一度プレイする、SNSシェア機能
	 */
	gameEnd() {
		this.isGameEnd = true
		this.bgm = this.sound.add('gameOver')
		this.bgm.setLoop(true)
		this.bgm.play()
		this.add
			.text(400, 520, '遊んでくれてありがとう！', {
				...defaultFontStyle,
			})
			.setOrigin(0.5, 0.5)
	}
}

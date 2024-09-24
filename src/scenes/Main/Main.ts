import { CanHoldObject } from '../../sprites/CanHoldObject/CanHoldObject'
import { Player } from '../../sprites/Player/Player'
import { defaultFontStyle, pointFontStyle } from '../../utils/fontStyle'

export class Main extends Phaser.Scene {
	constructor() {
		super({ key: 'main', active: false })
	}

	preload() {
		// Image
		this.load.image('background', 'assets/images/stage/background.png')
		this.load.image('floor', 'assets/images/stage/floor.png')
		this.load.image('sofa', 'assets/images/stage/sofa.png')
		this.load.image('window', 'assets/images/stage/window.png')
		this.load.image('bookshelf', 'assets/images/stage/bookshelf.png')
		this.load.image('tvChan', 'assets/images/stage/tvChan.png')
		this.load.image('trashBox', 'assets/images/stage/trashBox.png')
		this.load.image('grass', 'assets/images/stage/grass.png')
		this.load.image('grass2', 'assets/images/stage/grass2.png')
		this.load.image('table', 'assets/images/stage/table.png')
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
		this.load.audio('jump', 'assets/sounds/se/jump.mp3')
		this.load.audio('jumpLong', 'assets/sounds/se/jumpLong.mp3')
		this.load.audio('hold', 'assets/sounds/se/hold.mp3')
		this.load.audio('throw', 'assets/sounds/se/throw.mp3')
		this.load.audio('shoot', 'assets/sounds/se/shoot.mp3')
		this.load.audio('bound', 'assets/sounds/se/bound.mp3')
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private keyZ: Phaser.Input.Keyboard.Key
	private score = 0
	private player: Player
	private garbages: Phaser.Physics.Arcade.Group
	private timer: Phaser.Time.TimerEvent
	private timerCount = 5
	private timerText: Phaser.GameObjects.Text

	create() {
		// 初期化
		this.cursors = this.input.keyboard!.createCursorKeys()
		this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
		this.timer = this.time.addEvent({
			delay: 1000,
			callback: this.countDown,
			callbackScope: this,
			loop: true,
		})
		const bgm = this.sound.add('bgm')
		bgm.setLoop(true)
		bgm.play()

		// オブジェクト配置
		this.add.image(400, 300, 'background')

		const stage = this.physics.add.staticGroup()
		stage.create(400, 537, 'floor')

		const bookshelf = this.physics.add.staticSprite(689, 353, 'bookshelf')

		const sofa = this.physics.add.staticSprite(400, 430, 'sofa')
		sofa.setSize(162, 48).setOffset(20, 48)

		const window = this.physics.add.staticSprite(194, 179, 'window')
		window.setSize(332, 14).setOffset(0, 156)

		const tvChan = this.physics.add.staticSprite(757, 197, 'tvChan')
		tvChan.setSize(86, 64).setOffset(0, 14)

		this.physics.add.staticSprite(72, 209, 'grass')
		this.physics.add.staticSprite(124, 208, 'grass2')

		const trashBox = this.physics.add.staticSprite(180, 436, 'trashBox')
		trashBox.setSize(80, 20).setOffset(0, 0)

		const scoreText = this.add.text(16, 16, '0pt', {
			...defaultFontStyle,
		})

		this.timerText = this.add
			.text(400, 536, '30', {
				...defaultFontStyle,
				fontSize: '64px',
			})
			.setOrigin(0.5, 0.5)

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

		for (let i = 0; i < 30; i++) {
			this.garbages.add(
				new CanHoldObject(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 400),
					'wastepaper',
					this.sound,
					10,
				),
			)
		}

		for (let i = 0; i < 20; i++) {
			this.garbages.add(
				new CanHoldObject(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 400),
					'can',
					this.sound,
					20,
				),
			)
		}

		for (let i = 0; i < 20; i++) {
			this.garbages.add(
				new CanHoldObject(
					this,
					Phaser.Math.Between(0, 800),
					Phaser.Math.Between(0, 400),
					'bottle',
					this.sound,
					30,
				),
			)
		}

		for (let i = 0; i < 10; i++) {
			this.garbages.add(
				new CanHoldObject(
					this,
					Phaser.Math.Between(200, 800),
					Phaser.Math.Between(0, 400),
					'garbageBag',
					this.sound,
					50,
				),
			)
		}

		this.garbages.children.iterate((garbage) => {
			;(garbage as CanHoldObject).setCollideWorldBounds().setBounce(0.5)
			return true
		})

		// 接触判定
		this.physics.add.collider(this.player, stage)
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
				this.player.setVelocityY(-640)
			},
			(player) => {
				// 空中からの落下中のみ反応する
				return (
					(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body
						.velocity.y > 0
				)
			},
		)
		this.physics.add.collider(this.player, window, undefined, (player) => {
			if (this.cursors.down.isDown) {
				return false
			}
			return (
				(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
					.y > 0
			)
		})
		this.physics.add.collider(this.player, bookshelf, undefined, (player) => {
			if (this.cursors.down.isDown) {
				return false
			}
			return (
				(player as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.velocity
					.y > 0
			)
		})
		this.physics.add.collider(this.player, tvChan)

		this.physics.add.collider(this.garbages, stage)
		this.physics.add.collider(this.garbages, window)
		this.physics.add.collider(this.garbages, bookshelf)
		this.physics.add.collider(this.garbages, tvChan)

		this.physics.add.overlap(trashBox, this.garbages, (trashBox, _garbage) => {
			const garbage = _garbage as CanHoldObject
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
			const point = garbage.getPoint()
			const score = this.add.text(180, 406, `+${point}pt`, {
				...pointFontStyle(point),
			})
			this.tweens.add({
				targets: score,
				ease: 'Sine.easeInOut',
				duration: 800,
				repeat: 0,
				y: 396,
				alpha: 0,
			})
			this.score += point
			scoreText.setText(`${this.score}pt`)
		})
	}

	countDown() {
		this.timerCount -= 1
		if (this.timerCount === 0) {
			this.timer.destroy()
		}
	}

	gameOver() {
		this.physics.pause()
		this.add
			.text(400, 300, 'そこまで！', {
				...defaultFontStyle,
				fontSize: '64px',
			})
			.setOrigin(0.5, 0.5)
	}

	update() {
		this.player.update()

		// タイマー
		this.timerText.setText(this.timerCount.toString())
		if (this.timerCount === 0) {
			this.gameOver()
		}

		// プレイヤーに近接しているオブジェクトがあるか判定する
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
}

export class Title extends Phaser.Scene {
	constructor() {
		super({ key: 'title', active: true })
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private highScore: number

	preload() {
		this.load.image('sky', 'assets/sky.png')
	}

	create() {
		this.cursors = this.input.keyboard!.createCursorKeys()

		if (!this.registry.get('highScore')) {
			this.registry.set('highScore', 0)
		}
		this.highScore = this.registry.get('highScore')

		this.add.image(400, 300, 'sky')
		this.add
			.text(400, 200, 'sample game', { fontSize: '64px' })
			.setOrigin(0.5, 0.5)
		this.add
			.text(400, 400, 'press space key', { fontSize: '24px' })
			.setOrigin(0.5, 0.5)
		this.add.text(16, 16, `highScore: ${this.highScore}`, { fontSize: '32px' })
	}

	update() {
		if (this.cursors.space.isDown) {
			this.scene.start('main')
		}
	}
}

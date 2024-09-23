export class Title extends Phaser.Scene {
	constructor() {
		super({ key: 'title', active: true })
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private highScore: number

	preload() {
		this.load.image('title', 'assets/images/title.png')
	}

	create() {
		this.cursors = this.input.keyboard!.createCursorKeys()

		if (!this.registry.get('highScore')) {
			this.registry.set('highScore', 0)
		}
		this.highScore = this.registry.get('highScore')

		this.add.image(400, 300, 'title')
		this.add
			.text(400, 200, 'おそうじ大作戦(仮)', { fontSize: '64px', fontFamily: 'BestTen-DOT' })
			.setOrigin(0.5, 0.5)
		this.add
			.text(400, 400, 'スペースキーを押してね', { fontSize: '24px', fontFamily: 'BestTen-DOT' })
			.setOrigin(0.5, 0.5)
		this.add.text(16, 16, `ハイスコア: ${this.highScore}`, { fontSize: '32px', fontFamily: 'BestTen-DOT' })
	}

	update() {
		if (this.cursors.space.isDown) {
			this.scene.start('main')
		}
	}
}

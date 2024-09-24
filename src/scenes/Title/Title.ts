import { defaultFontStyle } from '../../utils/fontStyle'

export class Title extends Phaser.Scene {
	constructor() {
		super({ key: 'title', active: true })
	}

	private cursors: Phaser.Types.Input.Keyboard.CursorKeys
	private highScore: number

	preload() {
	}

	create() {
		this.cursors = this.input.keyboard!.createCursorKeys()

		if (!this.registry.get('highScore')) {
			this.registry.set('highScore', 0)
		}
		this.highScore = this.registry.get('highScore')

		this.add
			.text(400, 200, 'おそうじ大作戦(仮)', {
				...defaultFontStyle,
				fontSize: '64px',
				strokeThickness: 12,
				shadow: {
					...defaultFontStyle.shadow,
					offsetY: 8,
				},
			})
			.setOrigin(0.5, 0.5)
		this.add
			.text(400, 400, 'スペースキーを押してね', { ...defaultFontStyle })
			.setOrigin(0.5, 0.5)
		this.add.text(16, 16, `ハイスコア: ${this.highScore}`, { ...defaultFontStyle })
	}

	update() {
		if (this.cursors.space.isDown) {
			this.scene.start('main')
		}
	}
}

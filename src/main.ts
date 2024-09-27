import Phaser from 'phaser'
import { Title } from './scenes/Title/Title'
import { Main } from './scenes/Main/Main'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: [Title, Main],
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 300 },
			// debug: true,
		},
	},
}

new Phaser.Game(config)

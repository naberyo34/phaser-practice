import Phaser from 'phaser'
import { Title } from './scenes/Title/Title'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: Title,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 300 },
			debug: false,
		},
	},
}

new Phaser.Game(config)

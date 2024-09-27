export const defaultFontStyle: Phaser.Types.GameObjects.Text.TextStyle = {
	fontSize: '24px',
	fontFamily: 'BestTen-DOT',
	stroke: '#423934',
	strokeThickness: 6,
	shadow: {
		offsetY: 4,
		color: '#423934',
		stroke: true,
	},
}

export const pointFontStyle: (
	point: number,
) => Phaser.Types.GameObjects.Text.TextStyle = (point) => {
	const variableStyle = (() => {
		if (point <= 9) {
			return { fontSize: '12px', color: '#423934' }
		}
		if (point <= 10) {
			return { fontSize: '16px', color: '#423934' }
		}
		if (point <= 20) {
			return { fontSize: '20px', color: '#b4202a' }
		}
		if (point <= 30) {
			return { fontSize: '24px', color: '#285cc4' }
		}
		if (point <= 50) {
			return { fontSize: '28px', color: '#14a02e' }
		}
		return { fontSize: '32px', color: '#f9a31b' }
	})()

	return {
		...variableStyle,
		fontFamily: 'BestTen-DOT',
		stroke: '#fff',
		strokeThickness: 6,
		shadow: {
			offsetY: 2,
			color: '#423934',
			stroke: true,
		},
	}
}

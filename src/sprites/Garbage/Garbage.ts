export class Garbage extends Phaser.Physics.Arcade.Sprite {
	constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
		super(scene, x, y, texture)

		scene.add.existing(this)
		scene.physics.world.enable(this)
		this.setAngle(Phaser.Math.Between(0, 360))
	}

	/**
	 * このオブジェクトがあるオブジェクトに近接しているか。
	 * setNear によってのみ更新される。
	 */
	private isNear = false

	setNear(isNear: boolean) {
		this.isNear = isNear
		if (this.isNear) {
			this.setTint(0xff0000)
		} else {
			this.clearTint()
		}
	}
}

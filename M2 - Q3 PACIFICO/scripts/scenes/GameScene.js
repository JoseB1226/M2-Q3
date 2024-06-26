class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/tilemap/tilemap.json');
        this.load.image('tiles', 'assets/tilemap/tileset.png');
        this.load.spritesheet('mario', 'assets/images/mario.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('coin', 'assets/images/coin.png');
        this.load.audio('jumpSFX', 'assets/audio/sfx/jumpSFX.mp3');
        this.load.audio('winSFX', 'assets/audio/sfx/winSFX.mp3');
        this.load.audio('collectSFX', 'assets/audio/sfx/collectSFX.mp3');
        this.load.audio('gameoverSFX', 'assets/audio/sfx/gameoverSFX.mp3');
        this.load.audio('gameBGM', 'assets/audio/bgm/gameBGM.mp3');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tiles');

        const platformLayer = map.createLayer('platform', tileset, 0, 0);
        const waterLayer = map.createLayer('lava', tileset, 0, 0);
        const collectiblesLayer = map.createLayer('coin', tileset, 0, 0);

        platformLayer.setCollisionByProperty({ collides: true });
        waterLayer.setCollisionByProperty({ collides: true });

        collectiblesLayer.setTileIndexCallback([2, 4], this.collectCollectible, this);

       
        this.totalCollectibles = collectiblesLayer.filterTiles(tile => tile.index === 2 || tile.index === 4).length;

        this.gameBgm = this.sound.add('gameBGM', { loop: true, volume: 0.1 });
        this.gameBgm.play();

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player = this.physics.add.sprite(100, 900, 'mario');
        this.player.setScale(0.8);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, platformLayer);
        this.physics.add.collider(this.player, waterLayer, this.playerCollideWater, null, this);
        this.physics.add.overlap(this.player, collectiblesLayer);

        this.score = 0;
        this.collectibleCount = 0;

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFFFFF' }).setScrollFactor(0);
        this.collectibleImage = this.add.image(40, 80, 'coin').setScrollFactor(0);
        this.collectibleText = this.add.text(70, 60, 'x 0', { fontSize: '32px', fill: '#FFFFFF' }).setScrollFactor(0);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1);

       
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'mario', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('mario', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

      
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.onFloor()) {
            const jumpSound = this.sound.add('jumpSFX');
            jumpSound.volume = 0.05;
            jumpSound.play();
            this.player.setVelocityY(-300);
        }
    }

    collectCollectible(player, tile) {
        if (tile) {
            tile.tilemapLayer.removeTileAt(tile.x, tile.y);
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.collectibleCount += 1;
            this.collectibleText.setText('x ' + this.collectibleCount);
            const collectSound = this.sound.add('collectSFX');
            collectSound.volume = 0.5;
            collectSound.play();

            
            if (this.collectibleCount === this.totalCollectibles) {
                const winSound = this.sound.add('winSFX');
                winSound.volume = 0.5;
                this.gameBgm.stop();
                winSound.play();
                this.scene.start('WinScene');
            }
        }
    }

    playerCollideWater(player, water) {
        const gameOverSound = this.sound.add('gameoverSFX');
        gameOverSound.volume = 0.2;
        this.gameBgm.stop();
        gameOverSound.play();
        this.scene.start('GameOverScene', { score: this.score });
    }
}

export default GameScene;

/*

　マルチタッチサンプル

*/
phina.globalize();
var ASSETS = {
  // 画像
  image: {
    'bg': 'https://rawgit.com/alkn203/tomapiko_run/master/assets/bg.png',
  },
  sound: {
    'se1': 'https://rawgit.com/alkn203/phina_js_tips/master/assets/sounds/se_maoudamashii_chime14.mp3',
  },
};

var SCREEN_WIDTH  = 1600; // 画面横サイズ
var SCREEN_HEIGHT = 1200; // 画面縦サイズ

var INIT_LIFE = 200;
var DAMAGE_PER_DELTA = 1;


// constant
var SHARE_URL = 'http://unryu.org';  
var SHARE_MESSAGE = 'Have fun with OddFingers!';  
var SHARE_HASH_TAGS = 'OddFingers';  

// タイトルシーン
phina.define('TitleScene', {
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function(options) {
    this.superInit(options);
    // グループ
    var bgGroup = DisplayElement().addChildTo(this);
    // 背景追加
    (2).times(function(i) {
      Sprite('bg').addChildTo(bgGroup)
                  .setPosition(this.gridX.center() + i * SCREEN_WIDTH, this.gridY.center())
                  .setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
                  .physical.force(-1, 0);
    }, this);
    // タイトル
    Label({
      text: 'OddFingers',
      fontSize: 64,
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(4));

    Label({
      text: "TOUCH START",
      fontSize: 32,
    }).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.span(12))
      .tweener.fadeOut(1000).fadeIn(500).setLoop(true).play();
    // 画面タッチ時
    this.on('pointend', function() {
      // 次のシーンへ
      this.exit();
    });
    // 参照用
    this.bgGroup = bgGroup;
  },
  // 毎フレーム更新処理
  update: function() {
    // 背景のループ処理
    var first = this.bgGroup.children.first;
    if (first.right < 0) {
      first.addChildTo(this.bgGroup);
      this.bgGroup.children.last.left = this.bgGroup.children.first.right;
    }
  },
});

// 定数
var PARTICLE_NUM    = 256;
var FRICTION        = 0.96;
var TO_DIST         = SCREEN_WIDTH*0.86;
var STIR_DIST       = SCREEN_WIDTH*0.125;
var BLOW_DIST       = SCREEN_WIDTH*0.4;

/*
* パーティクル
*/
phina.define('Particle', {
  superClass: 'StarShape',
  
  init: function(color) {
    this.superInit({
      fill: color,
      stroke: null,
      radius: 4,
    });
    
    this.v = Vector2(0, 0);
    this.blendMode = 'lighter';
  },
  
  update: function(app) {
    var p  = app.pointer;
    var dv = Vector2.sub(this, p);
    var d  = dv.length() || 0.001;
    dv.div(d);  // normalize
    
    // タッチによる反発
    if (p.getPointing()) {
      if (d < BLOW_DIST) {
        var blowAcc = (1 - (d/BLOW_DIST)) * 14;
        this.v.x += dv.x * blowAcc + 0.5 - Math.random();
        this.v.y += dv.y * blowAcc + 0.5 - Math.random();
      }
    }


    // 距離が一定以内だと速度を調整する
    if (d<TO_DIST) {
      var toAcc = ( 1 - ( d / TO_DIST ) ) * SCREEN_WIDTH * 0.0014;
      this.v.x -= dv.x * toAcc;
      this.v.y -= dv.y * toAcc;
    }


    if (d<STIR_DIST) {
      var mAcc = ( 1 - (d / STIR_DIST) * SCREEN_WIDTH * 0.00026 );
      this.v.x += p.dx * mAcc * 0.1;
      this.v.y += p.dy * mAcc * 0.1;
    }

    // 摩擦
    this.v.mul(FRICTION);
    // 移動
    this.position.add(this.v);
    
    // ハミ出しチェック
    if (this.x > SCREEN_WIDTH) {
      this.x = SCREEN_WIDTH; this.v.x *= -1;
    }
    else if (this.x < 0) {
      this.x = 0; this.v.x *= -1;
    }
    if (this.y > app.height) {
      this.y = app.height; this.v.y *= -1;
    }
    else if (this.y < 0) {
      this.y = 0; this.v.y *= -1;
    }

    // スケール
    var scale = this.v.lengthSquared() * 0.04;
    scale = Math.clamp(scale, 0.75, 2);
    this.scaleX = this.scaleY = scale;
    
    // 回転
    this.rotation += scale*10;
  },
  
});

/*
 * メインシーン
 */

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',

  // 初期化
  init: function(options) {
    // super init
    this.superInit(options);

    // 背景色
    //this.backgroundColor = '#FFF';
    this.backgroundColor = '#000';

    this.label1 = phina.display.Label({text:"", fontSize: 256}).addChildTo(this);
    this.label1.x = this.gridX.center()/2;
    this.label1.y = this.gridY.center()*1.5;
    this.label2 = phina.display.Label({text:"", fontSize: 256}).addChildTo(this);
    this.label2.x = this.gridX.center()*1.5;
    this.label2.y = this.gridY.center()*1.5;

    this.life1 = phina.display.Label({text:"", fontSize: 128, fill:"white"}).addChildTo(this);
    this.life1.x = this.gridX.center()/2;
    this.life1.y = 64;
    this.life2 = phina.display.Label({text:"", fontSize: 128, fill:"white"}).addChildTo(this);
    this.life2.x = this.gridX.center()*1.5;
    this.life2.y = 64;
    life1 = INIT_LIFE;
    life2 = INIT_LIFE;

//    var color = ['red', 'blue', 'yellow', 'green', 'white'];
    var color = ['white', 'white', 'white', 'white', 'white'];
    var options = {
        backgroundColor: 'transparent',
        fill: 'white',
        stroke: null,
        strokeWidth: 3,
        radius: 64,
    };
    this.finger = [];
    for (var i = 0; i < 10; i++) {
        options.fill = color[i % 5];
        this.finger[i] = phina.display.CircleShape(options).addChildTo(this);
        this.finger[i].visible = false;
        this.finger[i].label = phina.display.Label({text:"", fontSize: 64})
          .addChildTo(this.finger[i])
          .setPosition(0, -96);
    }
    
    // canvas要素描画用
    var elem  = PlainElement({
      width: this.gridX.width,
      height: this.gridY.width, 
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
    // canvasパラメータ指定
    elem.canvas.context.strokeStyle = 'white';
    elem.canvas.context.lineWidth = 16;
    elem.canvas.drawLine(SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2, SCREEN_HEIGHT-1);

    // パーティクルを生成
    (PARTICLE_NUM).times(function() {
      var color = "hsla({0}, 75%, 50%, 1)".format(Math.randint(0, 360));
      var p = Particle(color).addChildTo(this);
      p.x = Math.randint(0, this.gridX.width);
      p.y = Math.randint(0, this.gridY.width);
    }, this);
  },
  
  onenter: function() {
    var scene = CountScene({
      backgroundColor: 'rgba(0, 0, 0, 1)',
      count: ['Put 1, 2, or 3 fingers \non the screen \nand get ready!'],
      fontSize: 100,
          fit: true,
    width: 1600,
    height: 1200,

    });
    this.app.pushScene(scene);
  },


  update: function() {
    var p = app.pointers;
    
    var ps1 = getfingers(p, 0,0,SCREEN_WIDTH/2,SCREEN_HEIGHT);
    var ps2 = getfingers(p, SCREEN_WIDTH/2,0,SCREEN_WIDTH/2,SCREEN_HEIGHT);
    this.label1.text = ps1;
    this.label2.text = ps2;
    for (var i = 0; i < 10; i++) {
        if (i < p.length) {
            this.finger[i].visible = true;
            this.finger[i].setPosition(p[i].x, p[i].y);
            this.finger[i].label.text = p[i].id;
        } else {
            this.finger[i].visible = false;
        }
    }
    if (ps1 % 2 == 0 && ps2 % 2 == 1){
      life1 = life1 - DAMAGE_PER_DELTA;
      this.label1.fill = 'red';
      //SoundManager.play('se1');
    }else{
      this.label1.fill = 'white';
    }
    if (ps2 % 2 == 0 && ps1 % 2 == 1){
      life2 = life2 - DAMAGE_PER_DELTA;
      this.label2.fill = 'red';
      //SoundManager.play('se1');
    }else{
      this.label2.fill = 'white';
    }
    this.life1.text = life1;
    this.life2.text = life2;
    if (life1 <= 0 && life2 <= 0){
      this.exit({  
        score: "DRAW",
        message: SHARE_MESSAGE,
        url: SHARE_URL,
        hashtags: SHARE_HASH_TAGS
      });
    }
    if (life1 <= 0){
      this.exit({  
        score: "Player 2 won!",
        message: SHARE_MESSAGE,
        url: SHARE_URL,
        hashtags: SHARE_HASH_TAGS
      });
    }
    if (life2 <= 0){
      this.exit({  
        score: "Player 1 won!",
        message: SHARE_MESSAGE,
        url: SHARE_URL,
        hashtags: SHARE_HASH_TAGS
      });
    }
    
    function getfingers(ps, x,y,w,h){
      var po = 0;
      for (var i = 0; i < ps.length; i++) {
        if (x <= ps[i].x && ps[i].x < x+w && y <= ps[i].y && ps[i].y < y+h){
            po++;
        }
      }
      return po;
    }
  },

  onkeydown: function(e) {
    // space if push space
    if (e.keyCode === 32) {
      this.app.stop();
    }
  },
});

/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  
    app = GameApp({
          assets: ASSETS,

      startLabel: location.search.substr(1).toObject().scene || 'title',
      fit: true,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });

  // app = phina.game.GameApp({
  //   startLabel: 'main',
  //   fit: true,
  //   width: 1600,
  //   height: 1200,
  // });
  app.enableStats();

  // 実行
  app.run();
});

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const HAND_POS = [
  cc.v2(-362, 236),
  cc.v2(281, 158),
  cc.v2(557, -68),
  cc.v2(557, -240),
];

const ORDER_PROGRESS = ["水", "色", "味", "碳酸氢钠"];
const ANSWER_CONFIG = [
  { type: "苹果汁", condition: "水,果绿色,苹果味,碳酸氢钠" },
  { type: "葡萄汁", condition: "水,葡萄色,葡萄味,碳酸氢钠" },
  { type: "芒果汁", condition: "水,柠檬黄色,芒果味,碳酸氢钠" },
  { type: "奶茶", condition: "水,牛奶巧克力色,奶茶味,碳酸氢钠" },
];

@ccclass
export default class Game extends cc.Component {
  @property(cc.Prefab)
  tipPrefab: cc.Prefab = null;
  @property(cc.Node)
  hand: cc.Node = null;
  @property(cc.AudioSource)
  audioSource: cc.AudioSource = null;
  @property(cc.AudioClip)
  failClip: cc.AudioClip = null;
  @property(cc.AudioClip)
  winClip: cc.AudioClip = null;
  @property([cc.AudioClip])
  progressAudios: cc.AudioClip[] = [];
  @property([cc.SpriteFrame])
  cupSpriteFrameList: cc.SpriteFrame[] = [];
  @property(cc.Sprite)
  cup: cc.Sprite = null;
  @property(cc.Node)
  choosePanel: cc.Node = null;
  @property(cc.Node)
  startPanel: cc.Node = null;
  @property(cc.Node)
  endPanel: cc.Node = null;
  @property([cc.SpriteFrame])
  fruitJuices: cc.SpriteFrame[] = [];
  @property(cc.Node)
  selectFruit: cc.Node = null;
  public static instance: Game = null;
  private _tip: cc.Node = null;
  private _curProgressId: number = 0;
  private m_isOver: boolean = false;
  private _isFinished = false;
  private _curSelectFruitId: number = -1;

  onLoad() {
    Game.instance = this;
    this.init();
  }

  init() {
    this.reset();
    this.startPanel.active = true;
    this.endPanel.active = false;
    this.selectFruit.active = false;
  }
  setHandPos() {
    const pos = HAND_POS[this._curProgressId];
    cc.tween(this.hand)
      .to(0.2, { position: cc.v3(pos.x, pos.y, 0) }, { easing: "smooth" })
      .start();
  }

  playAudio(clip: cc.AudioClip) {
    cc.audioEngine.stopAll();
    cc.audioEngine.play(clip, false, 0.6);
  }

  showTips(content) {
    if (!this._tip) {
      this._tip = cc.instantiate(this.tipPrefab);
    }

    // this._tip.parent = cc.Canvas.instance.node;
    this._tip.parent = cc.director.getScene();
    // this._tip.setPosition(cc.v2(0, 100));

    if (content) {
      this._tip.getComponent(cc.Animation).play();
      this._tip.getComponent("TipsCtrl").setContent(content);
    }
  }

  setCupStyle(str: string) {
    let id = -1;
    switch (str) {
      case "果绿色":
      case "苹果味":
        id = 0;
        break;
      case "葡萄色":
      case "葡萄味":
        id = 1;
        break;
      case "柠檬黄色":
      case "芒果味":
        id = 2;
        break;
      case "牛奶巧克力色":
      case "奶茶味":
        id = 3;
        break;
      case "水":
        id = 4;
        break;
      case "空":
        id = 5;
        break;
      case "碳酸氢钠":
        id = 6;
        break;
    }
    if (id != -1) {
      cc.tween(this.cup.node)
        .to(0.15, { opacity: 0 })
        .to(0.15, { opacity: 255 })
        .call(() => {
          if (id != 6) this.cup.spriteFrame = this.cupSpriteFrameList[id];
        })
        .start();
    }
  }

  updateSelectFruit(fruitId: number, initPos: cc.Vec2) {
    this.selectFruit.active = true;
    this.selectFruit.setPosition(initPos);
    this.selectFruit.scale = 0.8;
    this.selectFruit.getComponentInChildren(cc.Sprite).spriteFrame =
      this.fruitJuices[fruitId];
    cc.tween(this.selectFruit)
      .to(0.12, { scale: 1.2 })
      .to(0.12, { scale: 0.8 })
      .delay(0.6)
      .to(
        0.8,
        { position: cc.v3(-570, 340, 0), scale: 0.4 },
        { easing: "smooth" }
      )
      .delay(0.2)
      .call(() => {
        cc.tween(this.selectFruit)
          .repeatForever(
            cc
              .tween()
              .to(0.08, { angle: 15 })
              .to(0.08, { angle: 0 })
              .to(0.08, { angle: -15 })
              .to(0.08, { angle: 0 })
              .delay(3)
          )
          .start();
      })
      .start();
  }

  onClickItem(toggle: cc.Toggle, parm) {
    this.audioSource.play();
    const index = Number(toggle.node.name.split("_")[1]);
    if (index != this._curProgressId) {
      this.showTips("一步步来哦~");
      return;
    }
    this.setCupStyle(toggle.node.name.split("_")[0]);
  }

  isOver() {
    return this._curProgressId >= ORDER_PROGRESS.length - 1;
  }

  onClickAgain() {
    this.audioSource.play();
    this.reset();
    this.showChoosePanel();
  }

  reset() {
    cc.Tween.stopAll();
    this.m_isOver = false;
    this._curProgressId = 0;
    this._isFinished = false;
    this._curSelectFruitId = -1;
    this.selectFruit.active = false;
    this.setHandPos();
    this.setCupStyle("空");
  }

  onClickSelectFruitJuice(evt, parm) {
    this.audioSource.play();
    this._curSelectFruitId = Number(parm);
    if (this._isFinished) {
      this.playAudio(this.progressAudios[this._curProgressId]);
      this.updateSelectFruit(this._curSelectFruitId, evt.target.position);
      this.choosePanel.active = false;
    }
  }

  onClickLastStep() {
    this.audioSource.play();
    this._curProgressId--;
    if (this._curProgressId <= 0) {
      this._curProgressId = 0;
    }
    this.playAudio(this.progressAudios[this._curProgressId]);
    this.setHandPos();
  }
  onClickNextStep() {
    this.audioSource.play();
    this._curProgressId++;
    if (this._curProgressId >= HAND_POS.length - 1) {
      this._curProgressId = HAND_POS.length - 1;
    }
    this.playAudio(this.progressAudios[this._curProgressId]);
    this.setHandPos();
  }

  onClickStart() {
    this.audioSource.play();
    this.startPanel.active = false;
    this.showChoosePanel();
  }

  showChoosePanel() {
    this.choosePanel.active = true;
    const ani = this.choosePanel.getComponentInChildren(cc.Animation);
    ani.on(
      "finished",
      () => {
        this._isFinished = true;
        ani.node.children.forEach((node) => {
          node.getComponent(cc.Button).interactable = true;
        });
      },
      this
    );

    ani.node.children.forEach((node) => {
      node.getComponent(cc.Button).interactable = false;
    });

    ani.setCurrentTime(0, "fruitJump");
    this.scheduleOnce(() => {
      ani.play("fruitJump");
    }, 0.5);
  }
  onClickEnd() {
    this.audioSource.play();
    this.endPanel.active = true;
  }
  onClickBack() {
    this.init();
  }
}

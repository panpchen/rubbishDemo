// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const HAND_POS = [
  cc.v2(-304, -204),
  cc.v2(-125, 200),
  cc.v2(280, 220),
  cc.v2(580, -100),
  cc.v2(580, -260),
];

const ORDER_PROGRESS = ["汁", "水", "色", "味", "碳酸氢钠"];
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
  @property(cc.Node)
  winPanel: cc.Node = null;
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
  public static instance: Game = null;
  private _tip: cc.Node = null;
  private _selectItems: cc.Node[] = [];
  private _curProgressId: number = 0;
  private m_isOver: boolean = false;

  onLoad() {
    Game.instance = this;
    this.setHandPos();
    this.playAudio(this.progressAudios[this._curProgressId]);
  }

  setHandPos() {
    this.hand.setPosition(HAND_POS[this._curProgressId]);
  }

  playAudio(clip: cc.AudioClip) {
    cc.audioEngine.stopAll();
    cc.audioEngine.play(clip, false, 1);
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

  setCupStyle(name = "") {
    let id = -1;
    switch (name) {
      case "果绿色":
        id = 0;
        break;
      case "葡萄色":
        id = 1;
        break;
      case "柠檬黄色":
        id = 2;
        break;
      case "牛奶巧克力色":
        id = 3;
        break;
      case "水":
        id = 4;
        break;
      case "空杯":
        id = 5;
        break;
    }
    if (id != -1) {
      this.cup.spriteFrame = this.cupSpriteFrameList[id];
    }
  }

  onClickItem(toggle: cc.Toggle, parm) {
    this.audioSource.play();
    if (this.m_isOver) {
      if (!toggle.isChecked) {
        toggle.check();
      } else {
        toggle.uncheck();
      }
      this.showTips("已经调配完成啦, 请再调一杯吧");
      return;
    }

    let clickProgressId = 0;
    for (let i = 0; i < ORDER_PROGRESS.length; i++) {
      if (parm.indexOf(ORDER_PROGRESS[i]) != -1) {
        clickProgressId = i;
        break;
      }
    }

    // cc.error(clickProgressId, this._curProgressId);
    if (clickProgressId > this._curProgressId) {
      this.showTips("请按顺序执行哦");
      if (toggle.isChecked) {
        toggle.uncheck();
      }
      return;
    }

    if (clickProgressId < this._curProgressId) {
      this.showTips("已经做过该步骤了哦");
      if (!toggle.isChecked) {
        toggle.check();
      } else {
        toggle.uncheck();
      }
      return;
    }

    if (this.isOver()) {
      this.m_isOver = true;
      this._selectItems.push(toggle.node);
      this.winPanel.active = true;
      cc.tween(this.winPanel)
        .to(0.1, { scale: 2 })
        .to(0.5, { scale: 1 })
        .start();
      if (this.isWin()) {
        this.playAudio(this.winClip);
        this.winPanel.getComponentInChildren(cc.Label).string = "调配成功";
      } else {
        this.playAudio(this.failClip);
        this.winPanel.getComponentInChildren(cc.Label).string = "调配失败";
      }
      this.scheduleOnce(() => {
        this.winPanel.active = false;
      }, 2.5);

      return;
    }

    this._selectItems.push(toggle.node);
    this._curProgressId++;
    this.setCupStyle(toggle.node.name);
    this.playAudio(this.progressAudios[this._curProgressId]);
    this.setHandPos();
  }

  isOver() {
    return this._curProgressId >= ORDER_PROGRESS.length - 1;
  }

  isWin() {
    const itemType = this._selectItems[0].name;
    const newArray = this._selectItems
      .filter((v, i) => {
        return i > 0;
      })
      .map((v) => {
        return v.name;
      })
      .join(",");

    for (let i = 0; i < ANSWER_CONFIG.length; i++) {
      if (
        ANSWER_CONFIG[i].type == itemType &&
        ANSWER_CONFIG[i].condition == newArray
      ) {
        return true;
      }
    }

    return false;
  }

  onClickAgain() {
    this.audioSource.play();
    this.m_isOver = false;
    this._curProgressId = 0;
    this.setHandPos();
    this.setCupStyle("空杯");
    this._selectItems.forEach((toggle) => {
      toggle.getComponent(cc.Toggle).uncheck();
    });
    this._selectItems = [];
  }

  onClickSmallGame() {
    this.audioSource.play();
  }

  onClickSafeTest() {
    this.audioSource.play();
  }
}

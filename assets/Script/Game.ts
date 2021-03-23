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

@ccclass
export default class Game extends cc.Component {
  @property(cc.Prefab)
  tipPrefab: cc.Prefab = null;
  @property(cc.Node)
  hand: cc.Node = null;
  @property(cc.Node)
  winPanel: cc.Node = null;
  @property(cc.AudioClip)
  clickClip: cc.AudioClip = null;
  public static instance: Game = null;
  private _tip: cc.Node = null;
  private _selectItems: cc.Toggle[] = [];
  private _curProgressId: number = 0;
  private m_isOver: boolean = false;

  onLoad() {
    Game.instance = this;
    this.setHandPos();
  }

  setHandPos() {
    this.hand.setPosition(HAND_POS[this._curProgressId]);
  }

  showTips(content) {
    if (!this._tip) {
      this._tip = cc.instantiate(this.tipPrefab);
    }

    if (content) {
      this._tip.getComponent(cc.Animation).play();
      this._tip.getComponent("TipsCtrl").setContent(content);
    }
    this._tip.parent = cc.director.getScene();
  }

  onClickItem(toggle: cc.Toggle, parm) {
    cc.audioEngine.play(this.clickClip, false, 1);

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
      this._selectItems.push(toggle);
      cc.error(toggle.node.name);
      let isWin = true;
      this.winPanel.active = true;
      if (isWin) {
        this.winPanel.getComponentInChildren(cc.Label).string = "调配完成";
      } else {
        this.winPanel.getComponentInChildren(cc.Label).string = "调配失败";
      }
      this.scheduleOnce(() => {
        this.winPanel.active = false;
      }, 2.5);

      return;
    }

    this._selectItems.push(toggle);
    this._curProgressId++;
    this.setHandPos();
  }

  isOver() {
    return this._curProgressId >= ORDER_PROGRESS.length - 1;
  }

  isWin() {}

  onClickAgain() {
    cc.audioEngine.play(this.clickClip, false, 1);
    this.m_isOver = false;
    this._curProgressId = 0;
    this.setHandPos();
    this._selectItems.forEach((toggle) => {
      toggle.uncheck();
    });
    this._selectItems = [];
  }

  onClickSmallGame() {
    cc.audioEngine.play(this.clickClip, false, 1);
  }

  onClickSafeTest() {
    cc.audioEngine.play(this.clickClip, false, 1);
  }
}

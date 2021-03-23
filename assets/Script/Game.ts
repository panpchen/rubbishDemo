// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const HAND_POS = [
  cc.v2(-400, -40),
  cc.v2(-270, 146),
  cc.v2(190, 106),
  cc.v2(400, -40),
  cc.v2(330, -280),
];

const ORDER_PROGRESS = ["汁", "水", "色", "味", "碳酸氢钠"];

@ccclass
export default class Game extends cc.Component {
  @property(cc.Prefab)
  tipPrefab: cc.Prefab = null;
  @property(cc.Node)
  hand: cc.Node = null;
  public static instance: Game = null;
  private _tip: cc.Node = null;
  private _selectItemsName: string[] = [];
  private _curProgressId: number = -1;

  onLoad() {
    Game.instance = this;
    this._curProgressId = 0;
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

  onClickItem(evt: cc.Toggle, parm) {
    let clickProgressId = -1;
    for (let i = 0; i < ORDER_PROGRESS.length; i++) {
      if (parm.indexOf(ORDER_PROGRESS[i]) != -1) {
        clickProgressId = i;
        break;
      }
    }

    if (clickProgressId > this._curProgressId) {
      this.showTips("请按顺序执行哦");
      if (evt.isChecked) {
        evt.uncheck();
      }
      return;
    }

    if (clickProgressId < this._curProgressId) {
      this.showTips("已经做过该步骤了哦");
      if (!evt.isChecked) {
        evt.check();
      } else {
        evt.uncheck();
      }
      return;
    }

    this._selectItemsName.push(parm);

    this._curProgressId++;

    this.setHandPos();
  }

  onClickAgain() {}

  onClickSmallGame() {}

  onClickSafeTest() {}
}

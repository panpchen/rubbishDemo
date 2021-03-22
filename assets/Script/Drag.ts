// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Game from "./Game";
import PageThree from "./PageThree";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Drag extends cc.Component {
  private _label: cc.Label = null;
  private _data = null;
  private _isHitCorrect: boolean = false;
  private _lastPos: cc.Vec2 = null;
  private _pageThree: PageThree = null;

  onLoad() {
    this._label = this.node.getChildByName("label").getComponent(cc.Label);
  }
  _registerInput() {
    this.node.on(cc.Node.EventType.TOUCH_START, this._onStartEvt, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onMoveEvt, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this._onEndEvt, this);
  }

  _unregisterInput() {
    this.node.off(cc.Node.EventType.TOUCH_START, this._onStartEvt, this);
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onMoveEvt, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this._onEndEvt, this);
  }

  init(parent: PageThree, itemData) {
    this._pageThree = parent;
    this._data = itemData;
    this._label.string = this._data.txt;
    this.node.getComponent(cc.BoxCollider).enabled = true;
    this._registerInput();
  }

  onCollisionEnter(other, self) {
    const name = other.node.name.substring(4, other.node.name.length);
    const name2 = this._data.id.toString();
    this._isHitCorrect = name == name2;
  }

  _onStartEvt(evt: cc.Event.EventTouch) {
    this._lastPos = this.node.getPosition();
  }

  _onMoveEvt(evt: cc.Event.EventTouch) {
    const curPos = evt.getLocation();
    Game.instance.followNewCard(evt.target, curPos);
    this.node.setSiblingIndex(100);
  }

  _onEndEvt(evt: cc.Event.EventTouch) {
    if (this._isHitCorrect) {
      this._pageThree.checkComplete();
      this._unregisterInput();
      this.node.getComponent(cc.BoxCollider).enabled = false;
    } else {
      this.node.setPosition(this._lastPos);
    }
  }
}

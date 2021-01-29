// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Vec3, systemEvent, SystemEvent, EventMouse, Animation, log, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({type: Animation})
    public BodyAnim: Animation = null;

    @property({type: SkeletalAnimation})
    public CocosAnim: SkeletalAnimation = null;

    private _startJump:boolean = false;
    private _jumpStep:number = 0;
    private _curJumpTime:number = 0;
    private _jumpTime:number = 0.5;
    private _curJumpSpeed:number = 0;
    private _curPos:Vec3 = new Vec3();
    private _deltaPos:Vec3 = new Vec3(0, 0, 0);
    private _targetPos:Vec3 = new Vec3();
    private _isMoving:boolean = false;

    private _curMoveIndex = 0;

    // private _body:Node = null;
    // private _upDis:number = 0;
    // private _upSpeed:number = 0;
    // private _isUp:boolean = false;
    // private _bodyPos:Vec3 = new Vec3();

    start () {
        // Your initialization goes here.
        // systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);

        // this._body = this.node.children[0];
        // log(this._body.name);
    }

    setInputActive(active: boolean) {
        if (active) {
            systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onMouseUp(event:EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._isMoving) {
            return;
        }

        this.CocosAnim.getState('cocos_anim_jump').speed = 2.5; // 跳跃动画时间比较长，这里加速播放
        this.CocosAnim.play('cocos_anim_jump'); // 播放跳跃动画

        /* if (step === 1) {
            // this.BodyAnim.play('oneStep');
        }
        else if (step === 2) {
            // this.BodyAnim.play('twoStep');
        } */

        // this._isUp = true;
        // this._upDis = step;
        // this._upSpeed = this._upDis / this._jumpTime;

        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        this._curMoveIndex += step;

        this._isMoving = true;
    }

    onOnceJumpEnd() {
        this._isMoving = false;
        this.CocosAnim.play('cocos_anim_idle');
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    reset() {
        this.setInputActive(false);
        this.node.setPosition(Vec3.ZERO);
        this._curMoveIndex = 0;
    }

    update (deltaTime: number) {
        // Your update function goes here.
        if (this._startJump) {
            // log(deltaTime);
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // end
                // this._bodyPos.y = 0;
                // this._body.setPosition(this._bodyPos);

                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                // tween

                // if(this._isUp) {
                //     this._bodyPos.y += this._upSpeed * deltaTime;
                //     if(this._bodyPos.y >= this._upDis) {
                //         this._isUp = false;
                //     }
                // }
                // else {
                //     this._bodyPos.y -= this._upSpeed * deltaTime;
                // }
                // log(this._bodyPos);
                // this._body.setPosition(this._bodyPos);

                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }
}

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Prefab, instantiate, Node, CCInteger, Vec3, Label } from "cc";
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState{
    GS_NONE,
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class Typescript extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({type: Prefab})
    public cubePrfb: Prefab = null;

    @property({type: CCInteger})
    public roadLength: Number = 50;

    @property({type: Node})
    public startMenu: Node = null;

    @property({type: Label})
    public stepsLabel: Label = null;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;


    private _road: number[] = [];

    private _curState: GameState = GameState.GS_NONE;

    start () {
        // Your initialization goes here.
        this.curState = GameState.GS_INIT;
        this.playerCtrl.node.on('JumpEnd', this.onPlayerJumpEnd, this);
        // this.generateRoad();
    }

    init() {
        this.stepsLabel.string = '0';
        this.startMenu.active = true;
        this.generateRoad();
        this.playerCtrl.reset();
        // this.playerCtrl.setInputActive(false);
        // this.playerCtrl.node.setPosition(Vec3.ZERO);
    }

    generateRoad() {
        this.node.removeAllChildren();
        this._road = [];
        // startPos
        this._road.push(BlockType.BT_STONE);

        let numStone = 1;
        for (let i = 1; i < this.roadLength; i++) {
            if (numStone >= 5) {
                this._road.push(BlockType.BT_NONE);
                numStone = 0;
            } else if (this._road[i-1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
                numStone = 1;
            } else {
                let type = Math.floor(Math.random() * 2);
                this._road.push(type);
                if(type === BlockType.BT_STONE) {
                    numStone ++;
                }
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        let block = null;
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }

        return block;
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] === BlockType.BT_NONE) {   // 跳到了空方块上
                this.curState = GameState.GS_INIT;
            }
        } else {    // 跳过了最大长度
            this.curState = GameState.GS_INIT;
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onPlayerJumpEnd(moveIndex: number) {
        this.stepsLabel.string = moveIndex.toString();
        this.checkResult(moveIndex);
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    set curState (value: GameState) {
        if (this._curState === value) return;

        switch(value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.startMenu.active = false;
                setTimeout(() => {      // 直接设置 active 会直接开始监听鼠标事件，这里做了延迟处理
                    this.playerCtrl.setInputActive(true);
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
        this._curState = value;
    }
}

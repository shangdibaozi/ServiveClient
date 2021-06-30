
import { _decorator, Component, Node } from 'cc';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('GameControllerBehaviour')
export class GameControllerBehaviour extends Component {
    onLoad() {
        UIManager.show('LoginUI');
    }
}
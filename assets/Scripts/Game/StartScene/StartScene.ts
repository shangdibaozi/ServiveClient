
import { _decorator, Component, Node, director, resources, Scene } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartScene')
export class StartScene extends Component {

    async start () {
        // resources.loadDir()
        resources.loadDir('UI', () => {
            director.loadScene('Game');
        });
    }
}
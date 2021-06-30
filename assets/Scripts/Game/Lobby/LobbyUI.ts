
import { _decorator, Component, Node } from 'cc';
import { Helper } from '../../Helper';
import { UIBase } from '../../Libs/UIBase';
const { ccclass, property } = _decorator;

@ccclass('LobbyUI')
export class LobbyUI extends UIBase {
    _inputRoomKey: Node;

    on_btnEnterRoom() {
        let roomKey = this._inputRoomKey.$EditBox.string;
        if(!Helper.isStrEmpty(roomKey)) {
            console.log(roomKey);
        }
    }
}
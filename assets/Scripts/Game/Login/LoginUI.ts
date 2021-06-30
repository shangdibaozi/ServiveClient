
import { _decorator, Node, game } from 'cc';
import { Global } from '../../Global';
import { UIBase } from '../../Libs/UIBase';
const { ccclass, property } = _decorator;

enum LOGIN_STATE {
    NONE,
    START_CONNECT,
    CONNECTING,
    CONNECT_SUCCESS,
    CONNECT_FAIL,
    DISCONNECT,
    LOGIN_FAIL,
    LOGIN_SUCCESS
}

@ccclass('LoginUI')
export class LoginUI extends UIBase {
    
    _inputAccount: Node;

    onLoad() {
        
    }
    
    on_btnLogin() {
        Global.login.account = this._inputAccount.$EditBox.string;
        Global.login.password = Global.login.account;
        Global.login.loginState = LOGIN_STATE.START_CONNECT;
    }

    
}

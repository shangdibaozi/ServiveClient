import { _decorator, Component, game } from "cc";
import { NET_EVENT } from "../Constants";
import { UIManager } from "../Game/UIManager";
import { Global } from "../Global";
import { KBEngine } from "../Libs/KBEngine";


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

const { ccclass } = _decorator;
@ccclass('Login')
export class Login extends Component {
    _loginState: LOGIN_STATE = LOGIN_STATE.NONE;
    set loginState(val: LOGIN_STATE) {
        this._loginState = val;
        this.switchState(val);
    }

    account: string = '';
    password: string = '';
    channel: string = '';

    onLoad() {
        game.addPersistRootNode(this.node);

        let ip = '127.0.0.1';
        let port = 20013;
        this.init(ip, port);
    }

    init(ip: string, port: number) {
        this.initKBEngineArgs(ip, port);
        this.installEvents();
    }

    /**
     * 初始化连接服务器相关参数
     */
    private initKBEngineArgs(ip: string, port: number) {
        let args = new KBEngine.KBEngineArgs();
        args.ip = ip;
        args.port = port;
        args.serverHeartbeatTick = 10;
        args.netEvent = Global.netEvent;
        KBEngine.KBEngineApp.create(args, true);
    }

    private installEvents() {
        let netEvent = Global.netEvent;
        // KBEngine events
        netEvent.on(KBEngine.EventTypes.onLoginFailed, this.onLoginFailed, this);
        netEvent.on(KBEngine.EventTypes.onLoginBaseappFailed, this.onLoginBaseappFailed, this);
        netEvent.on(KBEngine.EventTypes.onConnectionState, this.onConnectionState, this);
        netEvent.on(KBEngine.EventTypes.onDisconnected, this.onDisconnected, this);

        // Custome events
        netEvent.on(NET_EVENT.LOGIN_SUCCESSFULLY, this.onLoginSuccessfully, this);
        netEvent.on(NET_EVENT.CREATE_AVATAR, this.onCreateAvatar, this);
        netEvent.on(NET_EVENT.AVATAR_ENABLE, this.onAvatarEnable, this);
    }

    private switchState(state: LOGIN_STATE) {
        if(state === LOGIN_STATE.NONE) {
            return;
        }
        else if(state === LOGIN_STATE.START_CONNECT) {
            this.startLogin();
        }
        else if(state === LOGIN_STATE.CONNECT_FAIL) {
            this.startLogin();
        }
        else if(state === LOGIN_STATE.LOGIN_FAIL) {
            this.startLogin();
        }
        else if(state === LOGIN_STATE.DISCONNECT) {
            this.startLogin();
        }
    }

    private startLogin() {
        if(this._loginState === LOGIN_STATE.CONNECTING) {
            return;
        }
        this._loginState = LOGIN_STATE.CONNECTING;
        Global.netEvent.emit(KBEngine.EventTypes.login, this.account, this.password, this.channel);
    }

    private onLoginFailed(failedCode: number): void {
        this._loginState = LOGIN_STATE.LOGIN_FAIL;
        console.error(KBEngine.KBEngineApp.app.serverErr(failedCode));
    }

    private onLoginBaseappFailed(): void {
        this._loginState = LOGIN_STATE.LOGIN_FAIL;
    }

    private onConnectionState(isSuccess: boolean): void {
        if(isSuccess) {
            this._loginState = LOGIN_STATE.CONNECT_SUCCESS;
        }
        else {
            this._loginState = LOGIN_STATE.CONNECT_FAIL;
        }
    }

    private onDisconnected() {
        this._loginState = LOGIN_STATE.DISCONNECT;
    }

    private onLoginSuccessfully(): void {
        this._loginState = LOGIN_STATE.LOGIN_SUCCESS;
        console.log('login successfully');
        Global.account.reqAvatarList();
    }

    private onCreateAvatar(): void {
        throw new Error('Method not implemented.');
    }

    /**
     * 玩家初始数据全部下发成功
     */
    private onAvatarEnable(): void {
        UIManager.show('LobbyUI').destroyUI('LoginUI');
    }
}
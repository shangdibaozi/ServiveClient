import { NET_EVENT } from "../Constants";
import { Global } from "../Global";
import { KBEngine } from "../Libs/KBEngine";

@KBEngine.register('Account')
export class Account extends KBEngine.Entity {
    __init__() {
        super.__init__();
        Global.account = this;
        Global.netEvent.emit(NET_EVENT.LOGIN_SUCCESSFULLY, KBEngine.KBEngineApp.app.entity_uuid, this.id, this);
    }

    onDestroy() {
        throw new Error("Method not implemented.");
    }
    onControlled(bIsControlled: boolean) {
        throw new Error("Method not implemented.");
    }
    onEnterWorld() {
        throw new Error("Method not implemented.");
    }
    onLeaveWorld() {
        throw new Error("Method not implemented.");
    }
    onEnterSpace() {
        throw new Error("Method not implemented.");
    }
    onLeaveSpace() {
        throw new Error("Method not implemented.");
    }
    onUpdateVolatileData() {
        throw new Error("Method not implemented.");
    }

    reqAvatarList() {
        this.baseCall('reqAvatarList');
    }

    reqCreateAvatar(avatarType: number, avatarNickName: string) {
        this.baseCall('reqCreateAvatar', avatarType, avatarNickName);
    }

    selectAvatarGame(dbid: UINT64) {
        this.baseCall('selectAvatarGame', dbid);
    }

    reqRemoveAvatar(dbid: number) {
        this.baseCall('reqRemoveAvatar', dbid);
    }

    onReqAvatarList(avatarLst: AvatarInfo[]) {
        if(avatarLst.length === 0) {
            this.reqCreateAvatar(0, Global.login.account);
        }
        else {
            this.selectAvatarGame(avatarLst[0].dbid);
        }
    }

    onRemoveAvatar() {

    }
}
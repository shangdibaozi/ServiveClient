import { NET_EVENT } from "../Constants";
import { Global } from "../Global";
import { KBEngine } from "../Libs/KBEngine";
import { OpRoom } from "./Components/OpRoom";

@KBEngine.register('Avatar')
export class Avatar extends KBEngine.Entity {
    opRoom: OpRoom = new OpRoom();

    __init__() {
        super.__init__();
        console.log('Avatar __init__');
        Global.player = this;
    }

    onDestroy() {
        console.log("onDestroy.");
    }
    
    onControlled(bIsControlled: boolean) {
        console.log("onControlled.");
    }

    onEnterWorld() {
        console.log("onEnterWorld.");
    }

    onLeaveWorld() {
        console.log("onLeaveWorld.");
    }

    onEnterSpace() {
        console.log("onEnterSpace.");
    }

    onLeaveSpace() {
        console.log("onLeaveSpace.");
    }

    onUpdateVolatileData() {
        console.log("onUpdateVolatileData.");
    }

    onAvatarEnabled() {
        console.log('onAvatarEnable');
        Global.netEvent.emit(NET_EVENT.AVATAR_ENABLE);
    }

    onKillServer(leftTime: number) {

    }
}
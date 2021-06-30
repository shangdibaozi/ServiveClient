import { KBEngine } from "../Libs/KBEngine";
import { OpRoom } from "./Components/OpRoom";

@KBEngine.register('Avatar')
export class Avatar extends KBEngine.Entity {
    opRoom: OpRoom = new OpRoom();

    __init__() {
        super.__init__();
        console.log('Avatar __init__');
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

    onAvatarEnabled() {
        console.log('onAvatarEnable');
    }

    onKillServer(leftTime: number) {

    }
}
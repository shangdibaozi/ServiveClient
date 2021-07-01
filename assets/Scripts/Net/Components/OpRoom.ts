import { KBEngine } from "../../Libs/KBEngine";

@KBEngine.register('OpRoom')
export class OpRoom extends KBEngine.Component {
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

    enterRoom(roomKey: number) {
        this.baseCall('enterRoom', roomKey);
    }

    enterRoomCallback(type: number) {
        switch(type) {
            case 2000: {
                console.log('房间key无效');
                break;
            }
            case 2001: {
                console.log('房间满人');
                break;
            }
        }
    }
}
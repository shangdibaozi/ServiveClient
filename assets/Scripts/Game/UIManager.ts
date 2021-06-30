import { Component, error, instantiate, Node, Prefab, resources, _decorator } from "cc";
import { UIBase } from "../Libs/UIBase";

const { ccclass, property } = _decorator;
@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node)
    uiLayer: Node;

    private static inst: UIManager;
    private uiMap: Map<string, UIBase> = new Map();
    private uiLoading: Map<string, boolean> = new Map();

    zIndex: number = 0;

    onLoad() {
        UIManager.inst = this;
    }

    static show(uiName: UIName, ...args: any) {
        this.inst.show(uiName, ...args);
    }

    static hide(uiName: UIName) {
        let uiBase = this.inst.uiMap.get(uiName);
        if(uiBase) {
            if(uiBase.node.getSiblingIndex() >= this.inst.zIndex) {
                this.inst.zIndex--;
            }
            uiBase.node.active = false;
        }
        return this;
    }

    static destroyUI(uiName: UIName) {
        let uibase = this.inst.uiMap.get(uiName);
        if(uibase) {
            this.inst.uiMap.delete(uiName);
            uibase.node.destroyAllChildren();
            uibase.node.removeAllChildren();
            uibase.node.destroy();
            resources.release(`UI/${uiName}`, Prefab);
        }
        return this;
    }

    private async show(uiName: UIName, ...args: any) {
        if(this.uiLoading.get(uiName)) {
            return;
        }
        this.uiLoading.set(uiName, true);
        await this.instantiateUI(uiName);
        this.uiLoading.set(uiName, false);
        this.uiMap.get(uiName).show(...args);
    }

    private async instantiateUI(uiName: UIName) {
        let uiBase = this.uiMap.get(uiName);
        if(!uiBase) {
            let uiPrefab = await this.loadPrefab(uiName);
            let uiNode = instantiate(uiPrefab);
            uiNode.parent = this.uiLayer;
            uiBase = uiNode.getComponent(uiName) as UIBase
            this.uiMap.set(uiName, uiBase);
        }
        uiBase.node.setSiblingIndex(this.zIndex++);
        uiBase.node.active = true;
    }

    private async loadPrefab(uiName: UIName) {
        return new Promise<Prefab>((resolve, reject) => {
            resources.load(`UI/${uiName}`, Prefab, (err: Error, prefab: Prefab) => {
                if(err) {
                    console.error(err);
                }
                else {
                    resolve(prefab);
                }
            });
        });
    }
}
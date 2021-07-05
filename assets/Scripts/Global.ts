import { EventTarget } from "cc";
import { CustomEventTarget } from "./Libs/KBEngine";
import { Account } from "./Net/Account";
import { Avatar } from "./Net/Avatar";
import { Login } from "./Net/Login";



export class Global {
    static login: Login = new Login();
    static account: Account;
    static player: Avatar;

    static uiEvent: CustomEventTarget = new CustomEventTarget();
    static netEvent: CustomEventTarget = new CustomEventTarget();
}

window['Global'] = Global;
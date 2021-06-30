import { EventTarget } from "cc";
import { CustomEventTarget } from "./Libs/KBEngine";
import { Account } from "./Net/Account";
import { Login } from "./Net/Login";



export class Global {
    static login: Login = new Login();
    static account: Account;

    static uiEvent: CustomEventTarget = new CustomEventTarget();
    static netEvent: CustomEventTarget = new CustomEventTarget();
}


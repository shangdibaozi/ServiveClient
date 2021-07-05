import Long from 'long';

export module KBEngine {
    //#region 类型定义
    class Property {
        properUtype: number;
        aliasID: number;
        name: string;
        defaultValStr: string;
        utype: IDATATYPE;
        setmethod: Function;
        properFlags: number;

        constructor(properUtype: number, aliasID: number, name: string, defaultValStr: string, utype: IDATATYPE, setmethod: Function, properFlags: number) {
            this.properUtype = properUtype;
            this.aliasID = aliasID;
            this.name = name;
            this.defaultValStr = defaultValStr;
            this.utype = utype;
            this.setmethod = setmethod;
            this.properFlags = properFlags;
        }
    }

    class Method {
        methodUtype: number;
        aliasID: number;
        methodName: string;
        args: IDATATYPE[];

        constructor(methodUtype: number, aliasID: number, methodName: string, args: IDATATYPE[]) {
            this.methodUtype = methodUtype;
            this.aliasID = aliasID;
            this.methodName = methodName;
            this.args = args;
        }
    }

    class Module {
        name : string;
        aliasID2Properties: {[key: string]: Property};
        propertys : {[key: string]: Property};
        clientMethods : {[key: string]: Method};
        baseMethods : {[key: string]: Method};
        cellMethods : {[key: string]: Method};
        usePropertyDescrAlias: boolean;
        useMethodDescrAlias: boolean;
    }
    //#endregion

    //#region 全局属性
    let PACKET_MAX_SIZE = 1500;
    let PACKET_MAX_SIZE_TCP = 1460;
    let PACKET_MAX_SIZE_UDP = 1472;
    let MESSAGE_ID_LENGTH = 2;
    let MESSAGE_LENGTH_LENGTH = 2;
    let MESSAGE_LENGTH1_LENGTH = 4;
    let MESSAGE_MAX_SIZE = 65535;
    let CLIENT_NO_FLOAT = 0;
    let KBE_FLT_MAX = 3.402823466e+38;
    let KBEallModules: {[key: string]: {new() : Entity | Component}} = Object.create(null);
    let KBEngineapp: KBEngineApp = null;
    let moduleDefs: Map<string, Module> = new Map();
    let idModuleDefs: Map<number, Module> = new Map();
    let KBEngineDatatypes: {[key: string]: IDATATYPE} = Object.create(null);
    /**
     * 最小距离的平方（单位：像素）
     */
    let limtDistance = 0.1 * 0.1;
    /**
     * 注册实体、实体组件
     * @param className 类名
     * @param classType 类型
     */
    export function register(className: string) {
        return function(ctor: { new() : Entity | Component }) {
            KBEallModules[className] = ctor;
            console.log(`KBEngine.register: ${className}`);
        }
    }
    //#endregion

    enum EntityDataFlags {
        ED_FLAG_UNKOWN													= 0x00000000, // 未定义
        ED_FLAG_CELL_PUBLIC												= 0x00000001, // 相关所有cell广播
        ED_FLAG_CELL_PRIVATE											= 0x00000002, // 当前cell
        ED_FLAG_ALL_CLIENTS												= 0x00000004, // cell广播与所有客户端
        ED_FLAG_CELL_PUBLIC_AND_OWN										= 0x00000008, // cell广播与自己的客户端
        ED_FLAG_OWN_CLIENT												= 0x00000010, // 当前cell和客户端
        ED_FLAG_BASE_AND_CLIENT											= 0x00000020, // base和客户端
        ED_FLAG_BASE													= 0x00000040, // 当前base
        ED_FLAG_OTHER_CLIENTS											= 0x00000080, // cell广播和其他客户端
    }

    //#region  entityDef

    interface IDATATYPE {
        bind(): void;

        createFromStream(stream: MemoryStream): any

        addToStream(stream: Bundle, v: any): void;

        parseDefaultValStr(v: any): any;

        isSameType(v: any): boolean
    }

    export class DATATYPE_UINT8 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readUint8();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeUint8(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < 0 || v > 0xff) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_UINT16 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readUint16();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeUint16(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < 0 || v > 0xffff) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_UINT32 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readUint32();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeUint32(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < 0 || v > 0xffffffff) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_UINT64 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readUint64();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeUint64(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            return v instanceof UINT64;
        }
    }

    export class DATATYPE_INT8 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readInt8();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeInt8(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < -0x80 || v > 0x7f) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_INT16 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readInt16();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeInt16(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < -0x8000 || v > 0x7fff) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_INT32 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readInt32();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeInt32(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            if (typeof (v) != "number") {
                return false;
            }
            if (v < -0x80000000 || v > 0x7fffffff) {
                return false;
            }
            return true;
        }
    }

    export class DATATYPE_INT64 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readInt64();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeInt64(v);
        }

        parseDefaultValStr(v: any) {
            return parseInt(v);
        }

        isSameType(v: any) {
            return v instanceof INT64;
        }
    }

    export class DATATYPE_FLOAT implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readFloat();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeFloat(v);
        }

        parseDefaultValStr(v: any) {
            return parseFloat(v);
        }

        isSameType(v: any) {
            return typeof (v) == "number";
        }
    }

    export class DATATYPE_DOUBLE implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readDouble();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeDouble(v);
        }

        parseDefaultValStr(v: any) {
            return parseFloat(v);
        }

        isSameType(v: any) {
            return typeof (v) == "number";
        }
    }

    export class DATATYPE_STRING implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readString();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeString(v);
        }

        parseDefaultValStr(v: any) {
            return typeof (v) == "string" ? v : "";
        }

        isSameType(v: any) {
            return typeof (v) == "string";
        }
    }

    export class DATATYPE_VECTOR2 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return CLIENT_NO_FLOAT ? new Vector2(stream.readInt32(), stream.readInt32()) : new Vector2(stream.readFloat(), stream.readFloat());
        }

        addToStream(stream: Bundle, v: any) {
            if (CLIENT_NO_FLOAT) {
                stream.writeInt32(v.x);
                stream.writeInt32(v.y);
            }
            else {
                stream.writeFloat(v.x);
                stream.writeFloat(v.y);
            }
        }

        parseDefaultValStr(v: any) {
            return new Vector2(0.0, 0.0);
        }

        isSameType(v: any) {
            return v instanceof Vector2 ? true : false;
        }
    }

    export class DATATYPE_VECTOR3 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            if (CLIENT_NO_FLOAT) {
                return new Vector3(stream.readInt32(), stream.readInt32(), stream.readInt32());
            }
            else {
                return new Vector3(stream.readFloat(), stream.readFloat(), stream.readFloat());
            }
        }

        addToStream(stream: Bundle, v: any) {
            if (CLIENT_NO_FLOAT) {
                stream.writeInt32(v.x);
                stream.writeInt32(v.y);
                stream.writeInt32(v.z);
            }
            else {
                stream.writeFloat(v.x);
                stream.writeFloat(v.y);
                stream.writeFloat(v.z);
            }
        }

        parseDefaultValStr(v: any) {
            return new Vector3(0.0, 0.0, 0.0);
        }

        isSameType(v: any) {
            return v instanceof Vector3 ? true : false;
        }
    }

    export class DATATYPE_VECTOR4 implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            if (CLIENT_NO_FLOAT) {
                return new Vector4(stream.readInt32(), stream.readInt32(), stream.readInt32(), stream.readInt32());
            }
            else {
                return new Vector4(stream.readFloat(), stream.readFloat(), stream.readFloat(), stream.readFloat());
            }
        }

        addToStream(stream: Bundle, v: any) {
            if (CLIENT_NO_FLOAT) {
                stream.writeInt32(v.x);
                stream.writeInt32(v.y);
                stream.writeInt32(v.z);
                stream.writeInt32(v.w);
            }
            else {
                stream.writeFloat(v.x);
                stream.writeFloat(v.y);
                stream.writeFloat(v.z);
                stream.writeFloat(v.w);
            }
        }

        parseDefaultValStr(v: any) {
            return new Vector4(0.0, 0.0, 0.0, 0.0);
        }

        isSameType(v: any) {
            return v instanceof Vector4 ? true : false;
        }
    }

    export class DATATYPE_PYTHON implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return stream.readBlob();
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeBlob(v);
        }

        parseDefaultValStr(v: any) {
            return new Uint8Array(v);
        }

        isSameType(v: any) {
            return false;
        }
    }

    export class DATATYPE_UNICODE implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            return UTF8ArrayToString(stream.readBlob());
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeBlob(StringToUTF8Array(v));
        }

        parseDefaultValStr(v: any) {
            return typeof (v) == "string" ? v : "";
        }

        isSameType(v: any) {
            return typeof (v) == "string";
        }
    }

    export class DATATYPE_ENTITYCALL implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            let cid = stream.readUint64();
            let id = stream.readInt32();
            let type = stream.readUint16();
            let utype = stream.readUint16();
        }

        addToStream(stream: Bundle, v: any) {
            let cid = new UINT64(0, 0);
            let id = 0;
            let type = 0;
            let utype = 0;
            stream.writeUint64(cid);
            stream.writeInt32(id);
            stream.writeUint16(type);
            stream.writeUint16(utype);
        }

        parseDefaultValStr(v: any) {
            return new Uint8Array(v);
        }

        isSameType(v: any) {
            return false;
        }
    }

    export class DATATYPE_BLOB implements IDATATYPE {
        bind() { }

        createFromStream(stream: MemoryStream) {
            let size = stream.readUint32();
            let buf = new Uint8Array(stream.buffer, stream.rpos, size);
            stream.rpos += size;
            return buf;
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeBlob(v);
        }

        parseDefaultValStr(v: any) {
            return new Uint8Array(v);
        }

        isSameType(v: any) {
            return true;
        }
    }

    export class DATATYPE_ARRAY implements IDATATYPE {
        type: IDATATYPE = null;

        bind() {
            if (typeof (this.type) == "number") {
                this.type = KBEngineDatatypes[this.type];
            }
        }

        createFromStream(stream: MemoryStream) {
            let size = stream.readUint32();
            let datas = [];
            while (size > 0) {
                size--;
                datas.push(this.type.createFromStream(stream));
            };
            return datas;
        }

        addToStream(stream: Bundle, v: any) {
            stream.writeUint32(v.length);
            for (let i = 0; i < v.length; i++) {
                this.type.addToStream(stream, v[i]);
            }
        }

        parseDefaultValStr(v: any): any[] {
            return [];
        }

        isSameType(v: any) {
            for (let i = 0; i < v.length; i++) {
                if (!this.type.isSameType(v[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    export class DATATYPE_FIXED_DICT implements IDATATYPE {
        dicttype = Object.create(null);;
        implementedBy: string = null;

        bind() {
            for (let itemkey in this.dicttype) {
                let utype = this.dicttype[itemkey];
                if (typeof (this.dicttype[itemkey]) == "number")
                    this.dicttype[itemkey] = KBEngineDatatypes[utype];
            }
        }

        createFromStream(stream: MemoryStream) {
            let datas = Object.create(null);;
            for (let itemkey in this.dicttype) {
                datas[itemkey] = this.dicttype[itemkey].createFromStream(stream);
            }
            return datas;
        }

        addToStream(stream: Bundle, v: any) {
            for (let itemkey in this.dicttype) {
                this.dicttype[itemkey].addToStream(stream, v[itemkey]);
            }
        }

        parseDefaultValStr(v: any) {
            return Object.create(null);;
        }

        isSameType(v: any) {
            for (let itemkey in this.dicttype) {
                if (!this.dicttype[itemkey].isSameType(v[itemkey])) {
                    return false;
                }
            }
            return true;
        }
    }

    class DATA_COMPONENT implements IDATATYPE {
        bind(): void {
            
        }
        createFromStream(stream: MemoryStream) {
            
        }
        addToStream(stream: Bundle, v: any): void {
            
        }
        parseDefaultValStr(v: any) {
            
        }
        isSameType(v: any): boolean {
            return false;
        }

    }

    KBEngineDatatypes["UINT8"] = new DATATYPE_UINT8();
    KBEngineDatatypes["UINT16"] = new DATATYPE_UINT16();
    KBEngineDatatypes["UINT32"] = new DATATYPE_UINT32();
    KBEngineDatatypes["UINT64"] = new DATATYPE_UINT64();
    KBEngineDatatypes["INT8"] = new DATATYPE_INT8();
    KBEngineDatatypes["INT16"] = new DATATYPE_INT16();
    KBEngineDatatypes["INT32"] = new DATATYPE_INT32();
    KBEngineDatatypes["INT64"] = new DATATYPE_INT64();
    KBEngineDatatypes["FLOAT"] = new DATATYPE_FLOAT();
    KBEngineDatatypes["DOUBLE"] = new DATATYPE_DOUBLE();
    KBEngineDatatypes["STRING"] = new DATATYPE_STRING();
    KBEngineDatatypes["VECTOR2"] = new DATATYPE_VECTOR2();
    KBEngineDatatypes["VECTOR3"] = new DATATYPE_VECTOR3();
    KBEngineDatatypes["VECTOR4"] = new DATATYPE_VECTOR4();
    KBEngineDatatypes["PYTHON"] = new DATATYPE_PYTHON();
    KBEngineDatatypes["UNICODE"] = new DATATYPE_UNICODE();
    KBEngineDatatypes["ENTITYCALL"] = new DATATYPE_ENTITYCALL();
    KBEngineDatatypes["BLOB"] = new DATATYPE_BLOB();
    //#endregion

    //#region 数据类型
    /**
     * 有符号64位整数
     * @param lo 低位值，32位整数
     * @param hi 高位值，大于32位整数范围的数值位
     */
    export class INT64 {
        lo: number = 0;
        hi: number = 0;
        sign: number = 1;
        long: Long;

        constructor(lo: number, hi: number) {
            if (hi >= 2147483648) {
                this.sign = -1;
                if (this.lo > 0) {
                    this.lo = (4294967296 - this.lo) & 0xffffffff;
                    this.hi = 4294967295 - this.hi;
                }
                else {
                    this.lo = (4294967296 - this.lo) & 0xffffffff;
                    this.hi = 4294967296 - this.hi;
                }
            } 
            else {
                this.sign = 1;
                this.hi = hi;
                this.lo = lo;
            }
            this.long = new Long(this.lo, this.hi, false);
        }

        toString() {
            return this.long.toString();

        }

        addSelf(other: number | Long) {
            this.long = this.long.add(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        add(other: number | Long) {
            return this.long.add(other);
        }

        subSelf(other: number | Long) {
            this.long = this.long.sub(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        sub(other: number | Long) {
            return this.long.sub(other);
        }

        /**
         * 0 if they are the same, 1 if the this is greater and -1 if the given one is greater
         */
        comp(other: number | Long) {
            return this.long.comp(other);
        }   
        
        mulSelf(other: number | Long) {
            this.long = this.long.mul(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        mul(other: number | Long) {
            return this.long.mul(other);
        }

        divSelf(other: number | Long) {
            this.long = this.long.div(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        div(other: number | Long) {
            return this.long.div(other);
        }
        
        isSame(other: UINT64) {
            if(!other) {
                return false;
            }
            return this.long.comp(other.long) === 0;
        }

        zero() {
            this.lo = 0;
            this.hi = 0;
            this.long.low = 0;
            this.long.high = 0;
        }
    }

    /**
     * 无符号64位整数
     * @param lo 低位值，32位整数
     * @param hi 高位值，大于32位整数范围的数值位
     */
    export class UINT64 {
        lo: number;
        hi: number;
        long: Long;
        constructor(lo: number, hi: number) {
            this.lo = lo >>> 0;
            this.hi = hi;
            this.long = new Long(this.lo, this.hi, true);
        }

        static Zero() {
            return new UINT64(0, 0);
        }
        
        toString() {
            return this.long.toString();
        }

        isZero() {
            return this.lo === 0 && this.hi === 0;
        }

        zero() {
            this.lo = 0;
            this.hi = 0;
            this.long.low = 0;
            this.long.high = 0;
        }

        addSelf(other: number | Long) {
            this.long = this.long.add(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        add(other: number | Long) {
            return this.long.add(other);
        }

        subSelf(other: number | Long) {
            this.long = this.long.sub(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        sub(other: number | Long) {
            return this.long.sub(other);
        }

        /**
         * 0 if they are the same, 1 if the this is greater and -1 if the given one is greater
         */
        comp(other: number | Long) {
            return this.long.comp(other);
        }   
        
        mulSelf(other: number | Long) {
            this.long = this.long.mul(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        mul(other: number | Long) {
            return this.long.mul(other);
        }

        divSelf(other: number | Long) {
            this.long = this.long.div(other);
            this.lo = this.long.low;
            this.hi = this.long.high;
            return this;
        }

        div(other: number | Long | string) {
            return this.long.div(other);
        }

        isSame(other: UINT64) {
            if(!other) {
                return false;
            }
            return this.long.comp(other.long) === 0;
        }
    }
    //#endregion

    //#region 日志打印
    /**打印信息 */
    function INFO_MSG(s: any) {
        console.info(s);
    }

    /**打印调试信息 */
    function DEBUG_MSG(s: any) {
        console.debug(s);
    }

    /**打印错误信息 */
    function ERROR_MSG(s: any) {
        console.error(s);
    }

    /**打印警告信息 */
    function WARNING_MSG(s: any) {
        console.warn(s);
    }
    //#endregion

    //#region  字符串相关
    /** 8位无符号整数值的类型化数组转字符串 */
    export function UTF8ArrayToString(array: Uint8Array): string {
        let out = "";
        let char1: number;
        let char2: number;
        let char3: number;

        for (let i = 0; i < array.length;) {
            char1 = array[i];
            switch (char1 >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    out += String.fromCharCode(char1);
                    i += 1;
                    break;
                case 12: case 13:
                    char2 = array[i + 1];
                    out += String.fromCharCode(((char1 & 0x1F) << 6) | (char2 & 0x3F));
                    i += 2;
                    break;
                case 14:
                    char2 = array[i + 1];
                    char3 = array[i + 2];
                    out += String.fromCharCode((char1 & 0x0F) << 12 | (char2 & 0x3F) << 6 | (char3 & 0x3F) << 0);
                    i += 3;
                    break;
                default:
                    ERROR_MSG("UTF8ArrayToString::execute flow shouldnt reach here.");
            }
        }
        return out;
    }

    /**字符串转8位无符号整数值类型化数组 */
    export function StringToUTF8Array(value: string): Uint8Array {
        let utf8 = new Array<number>();

        for (let i = 0; i < value.length; i++) {
            let charcode = value.charCodeAt(i);
            if (charcode < 0x80) {
                utf8.push(charcode);
            }
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                    | (value.charCodeAt(i) & 0x3ff))
                utf8.push(0xf0 | (charcode >> 18),
                    0x80 | ((charcode >> 12) & 0x3f),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
        }
        return new Uint8Array(utf8);
    }
    //#endregion

    // export let KBEevent: Event = new Event();
    //#endregion

    //#region 字节流解析
    class PackFloatXType {
        private _unionData: ArrayBuffer = new ArrayBuffer(4);
        fv: Float32Array = new Float32Array(this._unionData, 0, 1);
        uv: Uint32Array = new Uint32Array(this._unionData, 0, 1);
        iv: Int32Array = new Int32Array(this._unionData, 0, 1);
    }

    const _xPackData = new PackFloatXType();
    const _yPackData = new PackFloatXType();
    const _zPackData = new PackFloatXType();

    export class MemoryStream {
        rpos: number;
        wpos: number;
        buffer: ArrayBuffer;
        dataView: DataView;
        ui8Buff: Uint8Array;

        constructor(size_or_buffer: number | ArrayBuffer) {
            if (size_or_buffer instanceof ArrayBuffer) {
                this.buffer = size_or_buffer;
            }
            else {
                this.buffer = new ArrayBuffer(size_or_buffer);
            }
            this.dataView = new DataView(this.buffer);
            this.ui8Buff = new Uint8Array(this.buffer);
            this.rpos = 0;
            this.wpos = 0;
        }
        
        append(stream: MemoryStream, offset: number, size: number) {
            if(!(stream instanceof MemoryStream)) {
                ERROR_MSG('MemoryStream::append(): stream must be MemoryStream instances');
                return;
            }

            if(size > this.space()) {
                let newBuffer = new ArrayBuffer(this.buffer.byteLength + size * 2);
                let newUint8Buffer = new Uint8Array(newBuffer);
                newUint8Buffer.set(this.ui8Buff, 0);

                this.buffer = newBuffer;
                this.ui8Buff = newUint8Buffer;
                this.dataView = new DataView(this.buffer);
            }

            this.ui8Buff.set(new Uint8Array(stream.buffer, offset, size), this.wpos);

            this.wpos += size;
        }

        space(): number {
            return this.buffer.byteLength - this.wpos;
        }

        readInt8(): number {
            this.rpos += 1;
            return this.dataView.getInt8(this.rpos - 1);
        }

        readUint8(): number {
            this.rpos += 1;
            return this.dataView.getUint8(this.rpos - 1);
        }

        readUint16(): number {
            this.rpos += 2;
            return this.dataView.getUint16(this.rpos - 2, true);
        }

        readInt16(): number {
            this.rpos += 2;
            return this.dataView.getInt16(this.rpos - 2, true);
        }

        readUint32(): number {
            this.rpos += 4;
            return this.dataView.getUint32(this.rpos - 4, true);
        }

        readInt32(): number {
            this.rpos += 4;
            return this.dataView.getInt32(this.rpos - 4, true);
        }

        readUint64(): UINT64 {
            return new UINT64(this.readUint32(), this.readUint32());
        }

        readInt64(): INT64 {
            return new INT64(this.readUint32(), this.readUint32());
        }

        readFloat(): number {
            this.rpos += 4;
            return this.dataView.getFloat32(this.rpos - 4, true);
        }

        readDouble(): number {
            this.rpos += 8;
            return this.dataView.getFloat64(this.rpos - 8, true);
        }

        readString(): string {
            let s = '';
            while (true) {
                if (this.ui8Buff[this.rpos] != 0) {
                    s += String.fromCharCode(this.ui8Buff[this.rpos]);
                }
                else {
                    // 跳过\0
                    this.rpos++;
                    break;
                }

                this.rpos++;

                if (this.rpos >= this.buffer.byteLength) {
                    ERROR_MSG("KBEngine.MemoryStream::readString: rpos(" + (this.rpos) + ")>=" + this.buffer.byteLength + " overflow!");
                    break;
                }
            }
            return s;
        }

        readBlob(): Uint8Array {
            let size = this.readUint32();
            let buf = new Uint8Array(this.buffer, this.rpos, size);
            this.rpos += size;
            return buf;
        }

        readStream(): MemoryStream {
            let buf = new Uint8Array(this.buffer, this.rpos, this.buffer.byteLength - this.rpos);
            this.rpos = this.buffer.byteLength;
            return new MemoryStream(buf);
        }

        readPackXZ(): Array<number> {

            _xPackData.fv[0] = 0.0;
            _zPackData.fv[0] = 0.0;

            _xPackData.uv[0] = 0x40000000;
            _zPackData.uv[0] = 0x40000000;
            let v1 = this.readUint8();
            let v2 = this.readUint8();
            let v3 = this.readUint8();

            let data = 0;
            data |= (v1 << 16);
            data |= (v2 << 8);
            data |= v3;

            _xPackData.uv[0] |= (data & 0x7ff000) << 3;
            _zPackData.uv[0] |= (data & 0x0007ff) << 15;

            _xPackData.fv[0] -= 2.0;
            _zPackData.fv[0] -= 2.0;

            _xPackData.uv[0] |= (data & 0x800000) << 8;
            _zPackData.uv[0] |= (data & 0x000800) << 20;
            
            return [_xPackData.fv[0], _zPackData.fv[0]];
        }

        readPackY(): number {
            let data = this.readUint16();
            
            _yPackData.uv[0] = 0x40000000;
            _yPackData.uv[0] |= (data & 0x7fff) << 12;   // 解压，补足尾数
            _yPackData.fv[0] -= 2.0;                     // 此时还未设置符号位，当作正数处理，-2后再加上符号位即可，无需根据正负来+-2
            _yPackData.uv[0] |= (data & 0x8000) << 16;   // 设置符号位

            return _yPackData.fv[0];
        }

        writeInt8(value: number): void {
            this.dataView.setInt8(this.wpos, value);
            this.wpos += 1;
        }

        writeInt16(value: number): void {
            this.dataView.setInt16(this.wpos, value, true);
            this.wpos += 2;
        }

        writeInt32(value: number): void {
            this.dataView.setInt32(this.wpos, value, true);
            this.wpos += 4;
        }

        writeInt64(value: INT64): void {
            this.writeInt32(value.lo);
            this.writeInt32(value.hi);
        }

        writeUint8(value: any): void {
            this.dataView.setUint8(this.wpos, value);
            this.wpos += 1;
        }

        writeUint16(value: number): void {
            this.dataView.setUint16(this.wpos, value, true);
            this.wpos += 2;
        }

        writeUint32(value: number): void {
            this.dataView.setUint32(this.wpos, value, true);
            this.wpos += 4;
        }

        writeUint64(value: UINT64): void {
            this.writeUint32(value.lo);
            this.writeUint32(value.hi);
        }

        writeFloat(value: number): void {
            this.dataView.setFloat32(this.wpos, value, true);
            this.wpos += 4;
        }

        writeDouble(value: number): void {
            this.dataView.setFloat64(this.wpos, value, true);
            this.wpos += 8;
        }

        writeBlob(value: string | Uint8Array): void {
            let size = value.length;
            if (size + 4 > this.space()) {
                ERROR_MSG("memorystream::writeBlob: no free!");
                return;
            }

            this.writeUint32(size);

            if (typeof (value) == "string") {
                for (let i = 0; i < size; i++) {
                    this.ui8Buff[this.wpos++] = value.charCodeAt(i);
                }
            }
            else {
                for (let i = 0; i < size; i++) {
                    this.ui8Buff[this.wpos++] = value[i];
                }
            }
        }

        writeString(v: string): void {
            if (v.length > this.space()) {
                ERROR_MSG("memorystream::writeString: no free!");
                return;
            }
            
            for (let idx = 0; idx < v.length; idx++) {
                this.ui8Buff[this.wpos++] = v.charCodeAt(idx);
            }
            this.ui8Buff[this.wpos++] = 0;
        }

        readSkip(count: number): void {
            this.rpos += count;
        }

        length(): number {
            return this.wpos - this.rpos;
        }

        readEOF(): boolean {
            return this.buffer.byteLength - this.rpos <= 0;
        }

        done(): void {
            this.rpos = this.wpos;
        }

        getBuffer(): ArrayBuffer {
            return this.buffer.slice(this.rpos, this.wpos);
        }

        setbuffer(buffer: ArrayBuffer) {
            this.clear();
            this.buffer = buffer;
            this.dataView = new DataView(this.buffer);
            this.ui8Buff = new Uint8Array(this.buffer);
        }

        size() {
            return this.buffer.byteLength;
        }

        clear() {
            this.rpos = 0;
            this.wpos = 0;

            if (this.buffer.byteLength > PACKET_MAX_SIZE) {
                this.buffer = new ArrayBuffer(PACKET_MAX_SIZE);
                this.dataView = new DataView(this.buffer);
                this.ui8Buff = new Uint8Array(this.buffer);
            }
        }

        static _objects: MemoryStream[] = [];

        reclaimObject() {
            this.clear();
            if (MemoryStream._objects) {
                MemoryStream._objects.push(this);
            }
        }
    }

    function createMemoryObject(): MemoryStream {
        if (!MemoryStream._objects) {
            MemoryStream._objects = [];
        }
        return MemoryStream._objects.length > 0 ? MemoryStream._objects.pop() : new MemoryStream(PACKET_MAX_SIZE_TCP);
    }
    //#endregion

    //#region  Bundle
    export class Bundle {
        memorystreams: MemoryStream[] = [];
        stream: MemoryStream = createMemoryObject();
        numMessage: number = 0;
        messageLengthBuffer: Uint8Array = null;
        messageLength: number = 0;
        msgtype: Message = null;
        static _objects: Bundle[] = [];

        newMessage(msgtype: Message) {
            this.fini(false);

            this.msgtype = msgtype;
            this.numMessage += 1;

            if (this.msgtype.length == -1) {
                this.messageLengthBuffer = new Uint8Array(this.stream.buffer, this.stream.wpos + MESSAGE_ID_LENGTH, 2);
            }

            this.writeUint16(msgtype.id);

            if (this.messageLengthBuffer) {
                this.writeUint16(0);
                this.messageLengthBuffer[0] = 0;
                this.messageLengthBuffer[1] = 0;
                this.messageLength = 0;
            }
        }

        writeMsgLength(v: number) {
            if (this.messageLengthBuffer) {
                this.messageLengthBuffer[0] = v & 0xff;
                this.messageLengthBuffer[1] = v >> 8 & 0xff;
            }
        }

        fini(issend: boolean) {
            if (this.numMessage > 0) {
                this.writeMsgLength(this.messageLength);
                if (this.stream) {
                    this.memorystreams.push(this.stream);
                }

                this.stream = createMemoryObject();
            }

            if (issend) {
                this.messageLengthBuffer = null;
                this.numMessage = 0;
                this.msgtype = null;
            }
        }

        send(network: KBEngineApp) {
            this.fini(true);
            for (let i = 0; i < this.memorystreams.length; i++) {
                network.send(this.memorystreams[i].getBuffer());
            }

            this.reclaimObject();
        }

        checkStream(v: number) {
            if (v > this.stream.space()) {
                this.memorystreams.push(this.stream);
                this.stream = createMemoryObject();
            }
            this.messageLength += v;
        }

        writeInt8(v: number) {
            this.checkStream(1);
            this.stream.writeInt8(v);
        }

        writeInt16(v: number) {
            this.checkStream(2);
            this.stream.writeInt16(v);
        }

        writeInt32(v: number) {
            this.checkStream(4);
            this.stream.writeInt32(v);
        }

        writeInt64(v: INT64) {
            this.checkStream(8);
            this.stream.writeInt64(v);
        }

        writeUint8(v: any) {
            this.checkStream(1);
            this.stream.writeUint8(v);
        }

        writeUint16(v: number) {
            this.checkStream(2);
            this.stream.writeUint16(v);
        }

        writeUint32(v: number) {
            this.checkStream(4);
            this.stream.writeUint32(v);
        }

        writeUint64(v: UINT64) {
            this.checkStream(8);
            this.stream.writeUint64(v);
        }

        writeFloat(v: number) {
            this.checkStream(4);
            this.stream.writeFloat(v);
        }

        writeDouble(v: number) {
            this.checkStream(8);
            this.stream.writeDouble(v);
        }

        writeString(v: string) {
            this.checkStream(v.length + 1);
            this.stream.writeString(v);
        }

        writeBlob(v: any) {
            this.checkStream(v.length + 4);
            this.stream.writeBlob(v);
        }

        clear() {
            for (let i = 0; i < this.memorystreams.length; i++) {
                if (this.stream != this.memorystreams[i]) {
                    this.memorystreams[i].reclaimObject();
                }
            }

            if (this.stream) {
                this.stream.clear();
            }
            else {
                this.stream = createMemoryObject();
            }

            this.memorystreams.length = 0;
            this.numMessage = 0;
            this.messageLengthBuffer = null;
            this.messageLength = 0;
            this.msgtype = null;
        }

        reclaimObject() {
            this.clear();
            if (Bundle._objects) {
                Bundle._objects.push(this);
            }
        }
    }

    /**
     * 从缓存池中拿取bundle对象
     */
    function createBundleObject(): Bundle {
        if (!Bundle._objects) {
            Bundle._objects = [];
        }
        return Bundle._objects.length > 0 ? Bundle._objects.pop() : new Bundle();
    }
    //#endregion

    //#region  Message
    let reader = new MemoryStream(0);
    let datatype2id: {[key: string]: number} = Object.create(null);

    function mappingDataType() {
        datatype2id = Object.create(null);
        datatype2id["STRING"] = 1;
        datatype2id["STD::STRING"] = 1;
        datatype2id["UINT8"] = 2;
        datatype2id["BOOL"] = 2;
        datatype2id["DATATYPE"] = 2;
        datatype2id["CHAR"] = 2;
        datatype2id["DETAIL_TYPE"] = 2;
        datatype2id["ENTITYCALL_CALL_TYPE"] = 2;
        datatype2id["UINT16"] = 3;
        datatype2id["UNSIGNED SHORT"] = 3;
        datatype2id["SERVER_ERROR_CODE"] = 3;
        datatype2id["ENTITY_TYPE"] = 3;
        datatype2id["ENTITY_PROPERTY_UID"] = 3;
        datatype2id["ENTITY_METHOD_UID"] = 3;
        datatype2id["ENTITY_SCRIPT_UID"] = 3;
        datatype2id["DATATYPE_UID"] = 3;
        datatype2id["UINT32"] = 4;
        datatype2id["UINT"] = 4;
        datatype2id["UNSIGNED INT"] = 4;
        datatype2id["ARRAYSIZE"] = 4;
        datatype2id["SPACE_ID"] = 4;
        datatype2id["GAME_TIME"] = 4;
        datatype2id["TIMER_ID"] = 4;
        datatype2id["UINT64"] = 5;
        datatype2id["DBID"] = 5;
        datatype2id["COMPONENT_ID"] = 5;
        datatype2id["INT8"] = 6;
        datatype2id["COMPONENT_ORDER"] = 6;
        datatype2id["INT16"] = 7;
        datatype2id["SHORT"] = 7;
        datatype2id["INT32"] = 8;
        datatype2id["INT"] = 8;
        datatype2id["ENTITY_ID"] = 8;
        datatype2id["CALLBACK_ID"] = 8;
        datatype2id["COMPONENT_TYPE"] = 8;
        datatype2id["INT64"] = 9;
        datatype2id["PYTHON"] = 10;
        datatype2id["PY_DICT"] = 10;
        datatype2id["PY_TUPLE"] = 10;
        datatype2id["PY_LIST"] = 10;
        datatype2id["BLOB"] = 11;
        datatype2id["UNICODE"] = 12;
        datatype2id["FLOAT"] = 13;
        datatype2id["DOUBLE"] = 14;
        datatype2id["VECTOR2"] = 15;
        datatype2id["VECTOR3"] = 16;
        datatype2id["VECTOR4"] = 17;
        datatype2id["FIXED_DICT"] = 18;
        datatype2id["ARRAY"] = 19;
        datatype2id["ENTITYCALL"] = 20;
    }

    function bindReader(argType: number) {
        if (argType == datatype2id["UINT8"]) {
            return reader.readUint8;
        }
        else if (argType == datatype2id["UINT16"]) {
            return reader.readUint16;
        }
        else if (argType == datatype2id["UINT32"]) {
            return reader.readUint32;
        }
        else if (argType == datatype2id["UINT64"]) {
            return reader.readUint64;
        }
        else if (argType == datatype2id["INT8"]) {
            return reader.readInt8;
        }
        else if (argType == datatype2id["INT16"]) {
            return reader.readInt16;
        }
        else if (argType == datatype2id["INT32"]) {
            return reader.readInt32;
        }
        else if (argType == datatype2id["INT64"]) {
            return reader.readInt64;
        }
        else if (argType == datatype2id["FLOAT"]) {
            return reader.readFloat;
        }
        else if (argType == datatype2id["DOUBLE"]) {
            return reader.readDouble;
        }
        else if (argType == datatype2id["STRING"]) {
            return reader.readString;
        }
        else if (argType == datatype2id["PYTHON"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["VECTOR2"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["VECTOR3"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["VECTOR4"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["BLOB"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["UNICODE"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["FIXED_DICT"]) {
            return reader.readStream;
        }
        else if (argType == datatype2id["ARRAY"]) {
            return reader.readStream;
        }
        else {
            return reader.readStream;
        }
    }

    class Message {
        id: number;
        name: string;
        length: number;
        argsType: number;
        args: (() => number | string | INT64 | UINT64 | MemoryStream)[];
        handler: Function;

        constructor(id: number, name: string, length: number, argstype: number, args: number[], handler: Function) {
            this.id = id;
            this.name = name;
            this.length = length;
            this.argsType = argstype;

            this.args = new Array(args.length);
            // 绑定执行
            for (let i = 0; i < args.length; i++) {
                this.args[i] = bindReader(args[i]);
            }
            this.handler = handler;
        }

        createFromStream(msgstream: MemoryStream) {
            if (this.args.length <= 0)
                return msgstream;

            let result = new Array(this.args.length);
            for (let i = 0; i < this.args.length; i++) {
                result[i] = this.args[i].call(msgstream);
            }

            return result;
        }

        handleMessage(msgstream: MemoryStream) {
            if (!this.handler) {
                ERROR_MSG("Message::handleMessage: interface(" + this.name + "/" + this.id + ") no implement!");
                return;
            }

            if (this.args.length <= 0) {
                if (this.argsType < 0)
                    this.handler.call(KBEngineapp, msgstream);
                else
                    this.handler.call(KBEngineapp);
            }
            else {
                this.handler.apply(KBEngineapp, this.createFromStream(msgstream));
            }
        }
    }

    interface IKBEMessages {
        loginapp: {[key: string]: Message};
        baseapp: {[key: string]: Message};
        Loginapp_importClientMessages: Message;
        Baseapp_importClientMessages: Message;
        Baseapp_importClientEntityDef: Message;
        onImportClientMessages: Message;
        Baseapp_onRemoteCallCellMethodFromClient: Message;
        Entity_onRemoteMethodCall: Message;
        Loginapp_hello: Message;
        Baseapp_hello: Message;
        Loginapp_onClientActiveTick: Message;
        Baseapp_onClientActiveTick: Message;
        Loginapp_importServerErrorsDescr: Message;
        Loginapp_reqCreateAccount: Message;
        Baseapp_reqAccountBindEmail: Message;
        Baseapp_reqAccountNewPassword: Message;
        Baseapp_logoutBaseapp: Message;
        Loginapp_login: Message;
        Loginapp_reqAccountResetPassword: Message;
        Baseapp_loginBaseapp: Message;
        Baseapp_reloginBaseapp: Message;
        Baseapp_onUpdateDataFromClient: Message;
        Baseapp_onUpdateDataFromClientForControlledEntity: Message;
    }

    // 上行消息
    let KBEMessages: IKBEMessages = Object.create(null);
    KBEMessages['Loginapp_importClientMessages'] = new Message(5, 'importClientMessages', 0, 0, [], null);
    KBEMessages['Baseapp_importClientMessages'] = new Message(207, 'importClientMessages', 0, 0, [], null);
    KBEMessages['Baseapp_importClientEntityDef'] = new Message(208, 'importClientEntityDef', 0, 0, [], null);
    KBEMessages['onImportClientMessages'] = new Message(518, 'onImportClientMessages', -1, -1, [], null);
    KBEMessages['loginapp'] = Object.create(null);
    KBEMessages['baseapp'] = Object.create(null);

    let KBEClientMessages = Object.create(null);
    //#endregion

    //#region  Math
    export class Vector2 {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        distance(pos: Vector2) {
            let x = pos.x - this.x;
            let y = pos.y - this.y;
            return Math.sqrt(x * x + y * y);
        }

        add(vec2: Vector2) {
            this.x += vec2.x;
            this.y += vec2.y;
            return this;
        }

        sub(vec2: Vector2) {
            this.x -= vec2.x;
            this.y -= vec2.y;
            return this;
        }

        mul(num: number) {
            this.x *= num;
            this.y *= num;
            return this;
        }

        div(num: number) {
            this.x /= num;
            this.y /= num;
            return this;
        }

        neg() {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        }
    }

    export class Vector3 {
        x: number;
        y: number;
        z: number;

        constructor(x: number, y: number, z: number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        /**与其他坐标点的距离 */
        distance(pos: Vector3) {
            let x = pos.x - this.x;
            let y = pos.y - this.y;
            let z = pos.z - this.z;
            return Math.sqrt(x * x + y * y + z * z);
        }

        /**
         * 未开方的距离
         * @param pos 
         */
        distanceNoSqrt(pos: Vector3) {
            let x = pos.x - this.x;
            let y = pos.y - this.y;
            let z = pos.z - this.z;
            return x * x + y * y + z * z;
        }

        /**向量加法*/
        add(vec3: Vector3) {
            this.x += vec3.x;
            this.y += vec3.y;
            this.z += vec3.z;
            return this;
        }

        /**向量减法*/
        sub(vec3: Vector3) {
            this.x -= vec3.x;
            this.y -= vec3.y;
            this.z -= vec3.z;
            return this;
        }

        /**向量乘法*/
        mul(num: number) {
            this.x *= num;
            this.y *= num;
            this.z *= num;
            return this;
        }

        /**向量除法*/
        div(num: number) {
            this.x /= num;
            this.y /= num;
            this.z /= num;
            return this;
        }

        /**向量取反*/
        neg() {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        }
    }

    export class Vector4 {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x: number, y: number, z: number, w: number) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }

        distance(pos: Vector4) {
            let x = pos.x - this.x;
            let y = pos.y - this.y;
            let z = pos.z - this.z;
            let w = pos.w - this.w;
            return Math.sqrt(x * x + y * y + z * z + w * w);
        }

        add(vec4: Vector4) {
            this.x += vec4.x;
            this.y += vec4.y;
            this.z += vec4.z;
            this.w += vec4.w;
            return this;
        }

        sub(vec4: Vector4) {
            this.x -= vec4.x;
            this.y -= vec4.y;
            this.z -= vec4.z;
            this.w -= vec4.w;
            return this;
        }

        mul(num: number) {
            this.x *= num;
            this.y *= num;
            this.z *= num;
            this.w *= num;
            return this;
        }

        div(num: number) {
            this.x /= num;
            this.y /= num;
            this.z /= num;
            this.w /= num;
            return this;
        }

        neg() {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            this.w = -this.w;
            return this;
        }
    }

    function clampf(value: number, min_inclusive: number, max_inclusive: number) {
        if (min_inclusive > max_inclusive) {
            let temp = min_inclusive;
            min_inclusive = max_inclusive;
            max_inclusive = temp;
        }
        return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
    }

    function int82angle(angle: number, half: boolean) {
        return angle * (Math.PI / (half ? 254.0 : 128.0));
    }

    function angle2int8(v: number, half: boolean) {
        let angle = 0;
        if (!half) {
            angle = Math.floor((v * 128.0) / Math.PI + 0.5);
        }
        else {
            angle = clampf(Math.floor((v * 254.0) / Math.PI + 0.5), -128.0, 127.0);
        }
        return angle;
    }
    //#endregion

    //#region  Entity
    export abstract class Entity {
        private static defaultValues: Map<string, any> = new Map();
        id: number;
        className: string;
        position: Vector3;
        direction: Vector3;
        velocity: number;
        cell: EntityCall;
        base: EntityCall;
        inWorld: boolean;
        inited: boolean;
        isControlled: boolean;
        entityLastLocalPos: Vector3;
        entityLastLocalDir: Vector3;
        /**
         * 玩家是否在地面上
         */
        isOnGround: boolean;
        /**
         * 角色名称
         */
        name: string;

        constructor() {
            this.id = 0;
            this.className = '';
            this.position = new Vector3(0.0, 0.0, 0.0);
            this.direction = new Vector3(0.0, 0.0, 0.0);
            this.velocity = 0.0
            this.cell = null;
            this.base = null;
            // enterworld之后设置为true
            this.inWorld = false;
            // __init__调用之后设置为true
            this.inited = false;
            // 是否被控制
            this.isControlled = false;
            this.entityLastLocalPos = new Vector3(0.0, 0.0, 0.0);
            this.entityLastLocalDir = new Vector3(0.0, 0.0, 0.0);
            this.isOnGround = false;
            this.name = '';
        }

        resetDefaultValues() {
            Entity.defaultValues.forEach(this.initProperties, this);
        }

        private initProperties(value: any, key: string, map: Map<string, any>) {
            // 创建实体后会在构造函数里面实例化组件对象
            if(this[key] instanceof Component) {
                (this[key] as Component).resetDefaultValues();
            }
            else {
                this[key] = value;
            }
        }

        // 与服务端实体脚本中__init__类似, 代表初始化实体
        __init__() {
            this.inited = true;
        }

        callPropertysSetMethods() {
            let currModule = moduleDefs.get(this.className);
            for (let name in currModule.propertys) {
                let propertydata = currModule.propertys[name];
                
                if (propertydata.setmethod) {
                    let oldval = this[propertydata.name];
                    let flags = propertydata.properFlags;
                    // base类属性或者进入世界后cell类属性会触发set_*方法
                    // ED_FLAG_BASE_AND_CLIENT、ED_FLAG_BASE
                    if (flags == EntityDataFlags.ED_FLAG_BASE_AND_CLIENT || flags == EntityDataFlags.ED_FLAG_BASE) {
                        if (this.inited && !this.inWorld)
                            propertydata.setmethod.call(this, oldval);
                    }
                    else {
                        if (this.inWorld) {
                            if (flags == EntityDataFlags.ED_FLAG_CELL_PUBLIC_AND_OWN || flags == EntityDataFlags.ED_FLAG_OWN_CLIENT) {
                                if (!this.isPlayer)
                                    continue;
                            }
                            propertydata.setmethod.call(this, oldval);
                        }
                    }
                }
            }
        }

        abstract onDestroy(): any;

        abstract onControlled(bIsControlled: boolean): any;

        setComponents(modulesDef: Module) {
            for (let name in modulesDef.propertys) {
                let data = modulesDef.propertys[name];
                if (data.utype instanceof DATA_COMPONENT) {
                    let comp: Component = this[data.name];
                    if (comp) {
                        console.log(`${this.className} setComponents ${data.name}`);
                        comp.base.id = this.id;
                        comp.entityComponentPropertyID = data.properUtype;
                        comp.owner = this;
                        comp.__init__();
                    }
                }
            }
        }

        get isPlayer() {
            return this.id === KBEngineapp.entity_id;
        }

        baseCall(funName: string, ...args: any[]) {
            if (funName.length < 1) {
                ERROR_MSG('KBEngine.Entity::baseCall: not fount interfaceName!');
                return;
            }

            if (!this.base) {
                ERROR_MSG('KBEngine.Entity::baseCall: base is None!');
                return;
            }

            let method = moduleDefs.get(this.className).baseMethods[funName];

            if (!method) {
                ERROR_MSG("KBEngine.Entity::baseCall: The server did not find the def_method(" + this.className + "." + funName + ")!");
                return;
            }

            let methodArgs = method.args;
            if (methodArgs.length !== args.length) {
                ERROR_MSG("KBEngine.Entity::baseCall: args(" + methodArgs.length + "!= " + args.length + ") size is error!");
                return;
            }

            this.base.newCall();
            //适配组件
            this.base.bundle.writeUint16(0);
            this.base.bundle.writeUint16(method.methodUtype);

            try {
                for (let i = 0; i < args.length; i++) {
                    if (methodArgs[i].isSameType(args[i])) {
                        methodArgs[i].addToStream(this.base.bundle, args[i]);
                    }
                    else {
                        ERROR_MSG("KBEngine.Entity::baseCall: arg[" + i + "] is error!" + args[i]);
                        break
                    }
                }
            }
            catch (e) {
                ERROR_MSG(e.toString());
                ERROR_MSG('KBEngine.Entity::baseCall: args is error!');
                this.base.bundle = null;
                return;
            }
            this.base.sendCall(this.base.bundle);
        }

        cellCall(funName: string, ...args: any[]) {
            if (funName.length < 1) {
                ERROR_MSG('KBEngine.Entity::cellCall: not fount interfaceName!');
                return;
            }

            if (!this.cell) {
                ERROR_MSG('KBEngine.Entity::cellCall: cell is None!');
                return;
            }

            let method = moduleDefs.get(this.className).cellMethods[funName];

            if (!method) {
                ERROR_MSG("KBEngine.Entity::cellCall: The server did not find the def_method(" + this.className + "." + funName + ")!");
                return;
            }

            let methodArgs = method.args;
            if (methodArgs.length != args.length) {
                ERROR_MSG("KBEngine.Entity::cellCall: args(" + methodArgs.length + "!= " + args.length + ") size is error!");
                return;
            }

            this.cell.newCall();
            this.cell.bundle.writeUint16(0);
            this.cell.bundle.writeUint16(method.methodUtype);

            try {
                for (let i = 0; i < args.length; i++) {
                    if (methodArgs[i].isSameType(args[i])) {
                        methodArgs[i].addToStream(this.cell.bundle, args[i]);
                    }
                    else {
                        ERROR_MSG("KBEngine.Entity::cellCall: arg[" + i + "] is error!");
                        break;
                    }
                }
            }
            catch (e) {
                ERROR_MSG(e.toString());
                ERROR_MSG('KBEngine.Entity::cellCall: args is error!');
                this.cell.bundle = null;
                return;
            }

            this.cell.sendCall(this.cell.bundle);
        }

        enterWorld() {
            INFO_MSG(this.className + '::enterWorld: ' + this.id);
            this.inWorld = true;
            this.onEnterWorld();
            KBEngineapp.netEvent.emit(EventTypes.onEnterWorld, this);
        }

        abstract onEnterWorld(): any;

        leaveWorld() {
            INFO_MSG(this.className + '::leaveWorld: ' + this.id);
            this.inWorld = false;
            this.onLeaveWorld();
            KBEngineapp.netEvent.emit(EventTypes.onLeaveWorld, this);
        }

        abstract onLeaveWorld(): any;

        enterSpace() {
            // INFO_MSG(this.className + '::enterSpace: ' + this.id);
            this.onEnterSpace();

            // 要立即刷新表现层对象的位置
            KBEngineapp.netEvent.emit(EventTypes.set_position, this);
            KBEngineapp.netEvent.emit(EventTypes.set_direction, this);
        }

        abstract onEnterSpace(): any;

        leaveSpace() {
            // INFO_MSG(this.className + '::leaveSpace: ' + this.id);
            this.onLeaveSpace();
            KBEngineapp.netEvent.emit("onLeaveSpace", this);
        }

        abstract onLeaveSpace(): any;

        set_position(old: Vector3) {
            if (this.isPlayer) {
                KBEngineapp.entityServerPos.x = this.position.x;
                KBEngineapp.entityServerPos.y = this.position.y;
                KBEngineapp.entityServerPos.z = this.position.z;
            }

            if(this.inWorld) {
                KBEngineapp.netEvent.emit(EventTypes.set_position, this);
            }
        }

        abstract onUpdateVolatileData(): any;

        set_direction(old: Vector3) {
            KBEngineapp.netEvent.emit(EventTypes.set_direction, this);
        }
    }
    //#endregion

    //#region EntityComponent
    export abstract class Component {
        private static defaultValues: Map<string, any> = new Map();
        entityComponentPropertyID: number = 0;
		componentType: number = 0;
		ownerID: number = 0;
		owner: Entity = null;
        name_: string = '';
        
        className: string;
        position: Vector3;
        direction: Vector3;
        velocity: number;
        cell: EntityCall;
        base: EntityCall;
        inWorld: boolean;
        inited: boolean;
        isControlled: boolean;
        entityLastLocalPos: Vector3;
        entityLastLocalDir: Vector3;
        isOnGround: boolean;

        constructor() {
            this.base = new EntityCall();
            for(let className in KBEallModules) {
                if(this instanceof KBEallModules[className]) {
                    this.className = className;
                    break;
                }
            }
            if(this.className === '') {
                debugger;
            }
            this.base.className = this.className;
            this.base.type = ENTITYCALL_TYPE_BASE;
        }

        resetDefaultValues() {
            Component.defaultValues.forEach(this.initProperties, this);
        }

        private initProperties(value: any, key: string, map: Map<string, any>) {
            this[key] = value;
        }
        
        __init__() {
            this.inited = true;
        }

        callPropertysSetMethods() {
            let currModule = moduleDefs.get(this.className);
            for (let name in currModule.propertys) {
                let propertydata = currModule.propertys[name];
                
                if (propertydata.setmethod) {
                    let oldval = this[propertydata.name];
                    let flags = propertydata.properFlags;
                    // base类属性或者进入世界后cell类属性会触发set_*方法
                    // ED_FLAG_BASE_AND_CLIENT、ED_FLAG_BASE
                    if (flags == EntityDataFlags.ED_FLAG_BASE_AND_CLIENT || flags == EntityDataFlags.ED_FLAG_BASE) {
                        if (this.inited && !this.inWorld)
                            propertydata.setmethod.call(this, oldval);
                    }
                    else {
                        if (this.inWorld) {
                            if (flags == EntityDataFlags.ED_FLAG_CELL_PUBLIC_AND_OWN || flags == EntityDataFlags.ED_FLAG_OWN_CLIENT) {
                                if (!this.isPlayer)
                                    continue;
                            }
                            propertydata.setmethod.call(this, oldval);
                        }
                    }
                }
            }
        }

        abstract onDestroy(): any

        abstract onControlled(bIsControlled: boolean): any

        get isPlayer() {
            return this.entityComponentPropertyID == KBEngineapp.entity_id;
        }

        baseCall(funName: string, ...args: any[]) {
            if (funName.length < 1) {
                ERROR_MSG('KBEngine.Entity::baseCall: not fount interfaceName!');
                return;
            }

            if (this.base == undefined) {
                ERROR_MSG('KBEngine.Entity::baseCall: base is None!');
                return;
            }

            let method = moduleDefs.get(this.className).baseMethods[funName];

            if (method == undefined) {
                ERROR_MSG("KBEngine.Entity::baseCall: The server did not find the def_method(" + this.className + "." + funName + ")!");
                return;
            }

            let methodArgs = method.args;

            if (methodArgs.length !== args.length) {
                ERROR_MSG("KBEngine.Entity::baseCall: args(" + methodArgs.length + "!= " + args.length + ") size is error!");
                return;
            }

            this.base.newCall();
            //适配组件
            this.base.bundle.writeUint16(this.entityComponentPropertyID);
            this.base.bundle.writeUint16(method.methodUtype);

            try {
                for (let i = 0; i < args.length; i++) {
                    if (methodArgs[i].isSameType(args[i])) {
                        methodArgs[i].addToStream(this.base.bundle, args[i]);
                    }
                    else {
                        ERROR_MSG("KBEngine.Entity::baseCall: arg[" + i + "] is error!");
                        break;
                    }
                }
            }
            catch (e) {
                ERROR_MSG(e.toString());
                ERROR_MSG('KBEngine.Entity::baseCall: args is error!');
                this.base.bundle = null;
                return;
            }

            this.base.sendCall(this.base.bundle);
        }

        cellCall(funName: string, ...args: any[]) {
            if (funName.length < 1) {
                ERROR_MSG('KBEngine.Entity::cellCall: not fount interfaceName!');
                return;
            }

            if (this.cell == undefined) {
                ERROR_MSG('KBEngine.Entity::cellCall: cell is None!');
                return;
            }

            let method = moduleDefs.get(this.className).cellMethods[funName];

            if (method == undefined) {
                ERROR_MSG("KBEngine.Entity::cellCall: The server did not find the def_method(" + this.className + "." + funName + ")!");
                return;
            }

            let methodID = method[0];
            let methodArgs = method[3];

            if (methodArgs.length != args.length) {
                ERROR_MSG("KBEngine.Entity::cellCall: args(" + methodArgs.length + "!= " + args.length + ") size is error!");
                return;
            }

            this.cell.newCall();
            this.cell.bundle.writeUint16(this.entityComponentPropertyID);
            this.cell.bundle.writeUint16(methodID);

            try {
                for (let i = 0; i < args.length; i++) {
                    if (methodArgs[i].isSameType(args[i])) {
                        methodArgs[i].addToStream(this.cell.bundle, args[i + 1]);
                    }
                    else {
                        ERROR_MSG("KBEngine.Entity::cellCall: arg[" + i + "] is error!");
                        break;
                    }
                }
            }
            catch (e) {
                ERROR_MSG(e.toString());
                ERROR_MSG('KBEngine.Entity::cellCall: args is error!');
                this.cell.bundle = null;
                return;
            }

            this.cell.sendCall(this.cell.bundle);
        }

        enterWorld() {
            INFO_MSG(this.className + '::enterWorld: ' + this.entityComponentPropertyID);
            this.inWorld = true;
            this.onEnterWorld();
            KBEngineapp.netEvent.emit(EventTypes.onEnterWorld, this);
        }

        abstract onEnterWorld(): any;

        leaveWorld() {
            INFO_MSG(this.className + '::leaveWorld: ' + this.entityComponentPropertyID);
            this.inWorld = false;
            this.onLeaveWorld();
            KBEngineapp.netEvent.emit(EventTypes.onLeaveWorld, this);
        }

        abstract onLeaveWorld(): any;

        enterSpace() {
            INFO_MSG(this.className + '::enterSpace: ' + this.entityComponentPropertyID);
            this.onEnterSpace();
            KBEngineapp.netEvent.emit(EventTypes.onEnterSpace, this);

            // 要立即刷新表现层对象的位置
            KBEngineapp.netEvent.emit(EventTypes.set_position, this);
            KBEngineapp.netEvent.emit(EventTypes.set_direction, this);
        }

        abstract onEnterSpace(): any;

        leaveSpace() {
            INFO_MSG(this.className + '::leaveSpace: ' + this.entityComponentPropertyID);
            this.onLeaveSpace();
            KBEngineapp.netEvent.emit(EventTypes.onLeaveSpace, this);
        }

        abstract onLeaveSpace(): any;

        set_position(old: Vector3) {
            if (this.isPlayer) {
                KBEngineapp.entityServerPos.x = this.position.x;
                KBEngineapp.entityServerPos.y = this.position.y;
                KBEngineapp.entityServerPos.z = this.position.z;
            }
            KBEngineapp.netEvent.emit(EventTypes.set_position, this);
        }

        abstract onUpdateVolatileData(): any;

        set_direction(old: Vector3) {
            KBEngineapp.netEvent.emit(EventTypes.set_direction, this);
        }

        createFromStream(stream: MemoryStream) {
            this.componentType = stream.readUint32();
            this.ownerID = stream.readUint32();
            let descType = stream.readUint16();

            let count = stream.readUint16();
            if(count > 0) {
                this.onUpdateProperties(0, stream, count);
            }
        }

        onUpdateProperties(propUtype: number, stream: MemoryStream, maxCount: number) {
            let sm = moduleDefs.get(this.className);
            let pdatas = sm.aliasID2Properties;
            let utype = 0;
            let childUtype = propUtype;
            while(stream.length() > 0 && maxCount-- != 0) {
                if(childUtype === 0) {
                    if(sm.usePropertyDescrAlias) {
                        utype = stream.readUint8();
                        childUtype = stream.readUint8();
                    }
                    else {
                        utype = stream.readUint16();
                        childUtype = stream.readUint16();
                    }
                }

                let prop: Property = null;
                if(utype === 0) {
                    prop = pdatas[childUtype];
                }
                else {
                    prop = pdatas[utype]
                }
                let val = prop.utype.createFromStream(stream);
                let oldVal = this[prop.name];
                this[prop.name] = val;

                let setMethod = prop.setmethod;
                if(setMethod) {
                    setMethod.call(this, oldVal);
                }
            }
        }
    }
    //#endregion

    //#region  EntityCall
    export const ENTITYCALL_TYPE_CELL = 0;
    export const ENTITYCALL_TYPE_BASE = 1;

    export class EntityCall {
        id: number = 0;
        className: string = "";
        type: number = ENTITYCALL_TYPE_CELL;
        app: KBEngineApp = KBEngineapp;
        bundle: Bundle = null;

        constructor() { }

        isBase() {
            return this.type == ENTITYCALL_TYPE_BASE;
        }

        isCell() {
            return this.type == ENTITYCALL_TYPE_CELL;
        }

        newCall() {
            if (this.bundle == null)
                this.bundle = createBundleObject();
            if (this.type == ENTITYCALL_TYPE_CELL)
                this.bundle.newMessage(KBEMessages.Baseapp_onRemoteCallCellMethodFromClient);
            else
                this.bundle.newMessage(KBEMessages.Entity_onRemoteMethodCall);
            this.bundle.writeInt32(this.id);
            return this.bundle;
        }

        sendCall(bundle: Bundle) {
            if (bundle == undefined)
                bundle = this.bundle;
            bundle.send(this.app);
            if (this.bundle == bundle)
                this.bundle = null;
        }
    }
    //#endregion

    //#region  KBEngine args
    export class KBEngineArgs {
        /**服务器登录IP */
        ip: string = "127.0.0.1";
        /**服务器登录端口 */
        port: number = 20013;
        /**服务器域名，使用wss时使用 */
        domain: string = "";
        /**登录地址 */
        loginAddr: string = "";
        /**游戏地址 */
        baseAddr: string = "";
        /**更新频率 */
        updateHZ: number = 10 * 10;
        /**心跳时间间隔，单位：s */
        serverHeartbeatTick: number = 30;
        /**客户端类型 */
        clientType: number = 5;
        /**在Entity初始化时是否触发属性的set_*事件(callPropertysSetMethods)*/
        isOnInitCallPropertysSetMethods: boolean = true;
        /**是否用wss, 默认使用ws*/
        isWss: boolean = false;
        /**
         * 由外部传进来的事件管理器
         */
        netEvent: any = null;
    }
    //#endregion

    //#region  KBEngineEventType
    // 常量枚举，在编译为js代码后直接替换掉枚举名称。
    export const enum EventTypes {
        // Create new account.
        // <para> param1(string): accountName</para>
        // <para> param2(string): password</para>
        // <para> param3(bytes): datas // Datas by user defined. Data will be recorded into the KBE account database, you can access the datas through the script layer. If you use third-party account system, datas will be submitted to the third-party system.</para>
        createAccount = 200000,
        // Create account feedback results.
        // <para> param1(uint16): retcode. // server_errors</para>
        // <para> param2(bytes): datas. // If you use third-party account system, the system may fill some of the third-party additional datas. </para>
        onCreateAccountResult,
        // Request server binding account Email.
        // <para> param1(string): emailAddress</para>
        bindAccountEmail,
        // Response from binding account Email request.
        // <para> param1(uint16): retcode. // server_errors</para>
        onBindAccountEmail,
        // Request to set up a new password for the account. Note: account must be online.
        // <para> param1(string): old_password</para>
        // <para> param2(string): new_password</para>
        newPassword,
        // Response from a new password request.
        // <para> param1(uint16): retcode. // server_errors</para>
        onNewPassword,
        // Request to reset password for the account. Note: account must be online.
        // <para> param1(string): username</para>
        resetPassword,
        // Response from a reset password request.
        // <para> param1(uint16): retcode. // server_errors</para>
        onResetPassword,
        // ------------------------------------连接相关------------------------------------
        // Kicked of the current server.
        // <para> param1(uint16): retcode. // server_errors</para>
        onKicked,
        // Disconnected from the server.
        onDisconnected,
        // Status of connection server.
        // <para> param1(bool): success or fail</para>
        onConnectionState,
        // ------------------------------------logon相关------------------------------------
        // Login to server.
        // <para> param1(string): accountName</para>
        // <para> param2(string): password</para>
        // <para> param3(bytes): datas // Datas by user defined. Data will be recorded into the KBE account database, you can access the datas through the script layer. If you use third-party account system, datas will be submitted to the third-party system.</para>
        login,
        // Logout to baseapp, called when exiting the client.
        logout,
        // Relogin to baseapp.
        reloginBaseapp,
        // Engine version mismatch.
        // <para> param1(string): clientVersion
        // <para> param2(string): serverVersion
        onVersionNotMatch,
        // script version mismatch.
        // <para> param1(string): clientScriptVersion
        // <para> param2(string): serverScriptVersion
        onScriptVersionNotMatch,
        // Login failed.
        // <para> param1(uint16): retcode. // server_errors</para>
        onLoginFailed,
        // Login to baseapp.
        onLoginBaseapp,
        // Login baseapp failed.
        // <para> param1(uint16): retcode. // server_errors</para>
        onLoginBaseappFailed,
        // Relogin to baseapp.
        onReloginBaseapp,
        // Relogin baseapp success.
        onReloginBaseappSuccessfully,
        // Relogin baseapp failed.
        // <para> param1(uint16): retcode. // server_errors</para>
        onReloginBaseappFailed,
        // ------------------------------------实体cell相关事件------------------------------------
        // Entity enter the client-world.
        // <para> param1: Entity</para>
        onEnterWorld,
        // Entity leave the client-world.
        // <para> param1: Entity</para>
        onLeaveWorld,
        // Player enter the new space.
        // <para> param1: Entity</para>
        onEnterSpace,
        // Player leave the space.
        // <para> param1: Entity</para>
        onLeaveSpace,
        // Sets the current position of the entity.
        // <para> param1: Entity</para>
        set_position,
        // Sets the current direction of the entity.
        // <para> param1: Entity</para>
        set_direction,
        // The entity position is updated, you can smooth the moving entity to new location.
        // <para> param1: Entity</para>
        updatePosition,
        // The current space is specified by the geometry mapping.
        // Popular said is to load the specified Map Resources.
        // <para> param1(string): resPath</para>
        addSpaceGeometryMapping,
        // Server spaceData set data.
        // <para> param1(int32): spaceID</para>
        // <para> param2(string): key</para>
        // <para> param3(string): value</para>
        onSetSpaceData,
        // Start downloading data.
        // <para> param1(int32): rspaceID</para>
        // <para> param2(string): key</para>
        onDelSpaceData,
        // Triggered when the entity is controlled or out of control.
        // <para> param1: Entity</para>
        // <para> param2(bool): isControlled</para>
        onControlled,
        // Lose controlled entity.
        // <para> param1: Entity</para>
        onLoseControlledEntity,
        // ------------------------------------数据下载相关------------------------------------
        // Start downloading data.
        // <para> param1(uint16): resouce id</para>
        // <para> param2(uint32): data size</para>
        // <para> param3(string): description</para>
        onStreamDataStarted,
        // Receive data.
        // <para> param1(uint16): resouce id</para>
        // <para> param2(bytes): datas</para>
        onStreamDataRecv,
        // The downloaded data is completed.
        // <para> param1(uint16): resouce id</para>
        onStreamDataCompleted,

        /**
         * 心跳包
         */
        onTickCB
    }
    //#endregion

    //#region KBEngine app
    export class ServerErr {
        name: string = "";
        descr: string = "";
        id: number = 0;
    }

    export class KBEngineApp {
        args: KBEngineArgs;
        idInterval: any;
        username: string = "testhtml51";
        password: string = "123456";
        clientdatas: string = "";
        encryptedKey: string = "";
        serverErrs = Object.create(null);
        // 登录loginapp的地址
        ip: string = "";
        port: number = 0;
        domain: string = ""
        isWss: boolean = false;
        protocol: string = "";
        currconnect: string = "";

        // 服务端分配的baseapp地址
        baseappIP: string = "";
        baseappTcpPort: number = 0;
        baseappUdpPort: number = 0;

        currMsgID: number = 0;
        currMsgCount: number = 0;
        currMsgLen: number = 0;

        loginappMessageImported: boolean = false;
        baseappMessageImported: boolean = false;
        serverErrorsDescrImported: boolean = false;
        entitydefImported: boolean = false;
        FragmentDataTypes = {
            FRAGMENT_DATA_UNKNOW: 0,
            FRAGMENT_DATA_MESSAGE_ID: 1,
            FRAGMENT_DATA_MESSAGE_LENGTH: 2,
            FRAGMENT_DATA_MESSAGE_LENGTH1: 3,
            FRAGMENT_DATA_MESSAGE_BODY: 4
        };

        fragmentStream: MemoryStream = null;
        fragmentDatasFlag = this.FragmentDataTypes.FRAGMENT_DATA_UNKNOW;
        fragmentDatasRemain = 0;

        msgStream = new MemoryStream(PACKET_MAX_SIZE_TCP);
        currserver = "loginapp";
        currstate = "create";

        socket: WebSocket;

        serverVersion = "";
        serverScriptVersion = "";
        serverProtocolMD5 = "";
        serverEntityDefMD5 = "";
        clientVersion = "2.2.9";
        clientScriptVersion = "0.1.0";

        /**
         * 上次更新坐标到服务端的时间
         */
        lastTickTime: number = 0;
        lastTickCBTime: number = 0;

        entities: { [id: number]: Entity } = Object.create(null);
        bufferedCreateEntityMessage: { [id: number]: MemoryStream } = Object.create(null);
        entity_id: number = 0;
        entity_uuid: UINT64;
        entity_type: string = "";
        controlledEntities: Array<Entity> = new Array<Entity>();
        entityIDAliasIDList: Array<number> = new Array<number>();

        // 这个参数的选择必须与kbengine_defs.xml::cellapp/aliasEntityID的参数保持一致
        useAliasEntityID = true;

        isOnInitCallPropertysSetMethods = true;

        // 当前玩家最后一次同步到服务端的位置与朝向与服务端最后一次同步过来的位置
        entityServerPos = new Vector3(0.0, 0.0, 0.0);

        spacedata: { [key: string]: string } = Object.create(null);
        spaceID = 0;
        spaceResPath = "";
        isLoadedGeometry = false;

        component: string = "";
        serverdatas: Uint8Array;
        netEvent: CustomEventTarget = null;

        constructor(kbengineArgs: KBEngineArgs) {
            this.args = kbengineArgs;
            this.args.serverHeartbeatTick = this.args.serverHeartbeatTick * 1000 / 2; // 转为ms
            this.netEvent = kbengineArgs.netEvent;

            KBEngineapp = this;
            this.ip = this.args.ip;
            this.port = this.args.port;
            this.domain = this.args.domain;
            this.isWss = this.args.isWss;
            this.protocol = this.isWss ? "wss://" : "ws://";
        }

        static get app() {
            return KBEngineapp;
        }

        resetSocket() {
            if (KBEngineapp.socket != undefined && KBEngineapp.socket != null) {
                let sock = KBEngineapp.socket;

                sock.onopen = undefined;
                sock.onerror = undefined;
                sock.onmessage = undefined;
                sock.onclose = undefined;
                KBEngineapp.socket = null;
                sock.close();
            }
        }

        reset() {
            if (KBEngineapp.entities) {
                KBEngineapp.clearEntities(true);
            }
            KBEngineapp.resetSocket();
            KBEngineapp.currserver = "loginapp";
            KBEngineapp.currstate = "create";
            KBEngineapp.currconnect = "loginapp";
            // 扩展数据
            KBEngineapp.serverdatas = undefined;
            // 版本信息
            KBEngineapp.serverVersion = "";
            KBEngineapp.serverScriptVersion = "";
            KBEngineapp.serverProtocolMD5 = "";
            KBEngineapp.serverEntityDefMD5 = "";
            KBEngineapp.clientVersion = "2.5.10";
            KBEngineapp.clientScriptVersion = "0.1.0";
            // player的相关信息
            KBEngineapp.entity_uuid = null;
            KBEngineapp.entity_id = 0;
            KBEngineapp.entity_type = "";
            // 这个参数的选择必须与kbengine_defs.xml::cellapp/aliasEntityID的参数保持一致
            KBEngineapp.useAliasEntityID = true;
            // 当前玩家最后一次同步到服务端的位置与朝向与服务端最后一次同步过来的位置
            KBEngineapp.entityServerPos = new Vector3(0.0, 0.0, 0.0);
            // 客户端所有的实体
            KBEngineapp.entities = Object.create(null);
            KBEngineapp.entityIDAliasIDList = [];
            KBEngineapp.controlledEntities = [];
            // 空间的信息
            KBEngineapp.spacedata = Object.create(null);
            KBEngineapp.spaceID = 0;
            KBEngineapp.spaceResPath = "";
            KBEngineapp.isLoadedGeometry = false;
            KBEngineapp.lastTickTime = Date.now();
            KBEngineapp.lastTickCBTime = Date.now();
            mappingDataType();
            // 当前组件类别， 配套服务端体系
            KBEngineapp.component = "client";
        }

        installEvents() {
            this.netEvent.on(EventTypes.createAccount, this.createAccount, this);
            this.netEvent.on(EventTypes.login, this.login, this);
            this.netEvent.on(EventTypes.logout, this.logout, this);
            this.netEvent.on(EventTypes.reloginBaseapp, this.reloginBaseapp, this);
            this.netEvent.on(EventTypes.bindAccountEmail, this.bindAccountEmail, this);
            this.netEvent.on(EventTypes.newPassword, this.newPassword, this);
            this.netEvent.on(EventTypes.resetPassword, this.resetPassword, this);
        }

        uninstallEvents() {
            this.netEvent.targetOff(this);
        }

        hello() {
            let bundle = createBundleObject();
            if (KBEngineapp.currserver == "loginapp") {
                bundle.newMessage(KBEMessages.Loginapp_hello);
            }
            else {
                bundle.newMessage(KBEMessages.Baseapp_hello);
            }

            bundle.writeString(KBEngineapp.clientVersion);
            bundle.writeString(KBEngineapp.clientScriptVersion);
            bundle.writeBlob(KBEngineapp.encryptedKey);
            bundle.send(KBEngineapp);
        }

        player() {
            return KBEngineapp.entities[KBEngineapp.entity_id];
        }

        findEntity(entityID: number) {
            return KBEngineapp.entities[entityID];
        }

        connect(addr: string) {
            console.assert(KBEngineapp.socket == null, "Assertion of socket not is null");
            console.log('connect', addr);
            try {
                KBEngineapp.socket = new WebSocket(addr);
            }
            catch (e) {
                ERROR_MSG('WebSocket init error(' + e.toString() + ')!');
                KBEngineapp.netEvent.emit(EventTypes.onConnectionState, false);
                return;
            }

            KBEngineapp.socket.binaryType = "arraybuffer";
            KBEngineapp.socket.onopen = KBEngineapp.onopen;
            KBEngineapp.socket.onerror = KBEngineapp.onerror_before_onopen;
            KBEngineapp.socket.onmessage = KBEngineapp.onmessage;
            KBEngineapp.socket.onclose = KBEngineapp.onclose;
        }

        disconnect() {
            KBEngineapp.resetSocket();
        }

        onopen() {
            INFO_MSG('connect success!');
            KBEngineapp.socket.onerror = KBEngineapp.onerror_after_onopen;
            KBEngineapp.netEvent.emit(EventTypes.onConnectionState, true);
        }

        onerror_before_onopen(evt: Event) {
            ERROR_MSG('onerror_before_onopen error:' + evt);
            KBEngineapp.resetSocket();
            KBEngineapp.netEvent.emit(EventTypes.onConnectionState, false);
        }

        onerror_after_onopen(evt: Event) {
            ERROR_MSG('onerror_after_onopen error:' + evt);
            KBEngineapp.resetSocket();
            KBEngineapp.netEvent.emit(EventTypes.onDisconnected);
        }

        onmessage(msg: MessageEvent) {
            let stream = KBEngineapp.msgStream;
            stream.setbuffer(msg.data);
            stream.wpos = msg.data.byteLength;

            let app = KBEngineapp;

            while (stream.length() > 0 || app.fragmentStream != null) {
                if (app.fragmentDatasFlag == app.FragmentDataTypes.FRAGMENT_DATA_UNKNOW) {
                    if (app.currMsgID === 0) {
                        if (MESSAGE_ID_LENGTH > 1 && stream.length() < MESSAGE_ID_LENGTH) {
                            app.writeFragmentMessage(app.FragmentDataTypes.FRAGMENT_DATA_MESSAGE_ID, stream, MESSAGE_ID_LENGTH);
                            break;
                        }
                        app.currMsgID = stream.readUint16();
                    }
                    let msgHandler = KBEClientMessages[app.currMsgID];
                    if (!msgHandler) {
                        app.currMsgID = 0;
                        app.currMsgLen = 0;
                        ERROR_MSG("KBEngineApp::onmessage[" + app.currserver + "]: not found msg(" + app.currMsgID + ")!");
                        break;
                    }

                    let msglen = 0;
                    if (app.currMsgLen === 0) {
                        msglen = msgHandler.length;
                        if (msglen === -1) {
                            if (stream.length() < MESSAGE_LENGTH_LENGTH) {
                                app.writeFragmentMessage(app.FragmentDataTypes.FRAGMENT_DATA_MESSAGE_LENGTH, stream, MESSAGE_LENGTH_LENGTH);
                                break;
                            }
                            else {
                                msglen = stream.readUint16();
                                app.currMsgLen = msglen;

                                // 扩展长度
                                if (msglen === MESSAGE_MAX_SIZE) {
                                    if (stream.length() < MESSAGE_LENGTH1_LENGTH) {
                                        app.writeFragmentMessage(app.FragmentDataTypes.FRAGMENT_DATA_MESSAGE_LENGTH1, stream, MESSAGE_LENGTH1_LENGTH);
                                        break;
                                    }

                                    app.currMsgLen = stream.readUint32();
                                }
                            }
                        }
                        else {
                            app.currMsgLen = msglen;
                        }
                    }

                    if (app.fragmentStream !== null && app.fragmentStream.length() >= app.currMsgLen) {
                        msgHandler.handleMessage(app.fragmentStream);
                        app.fragmentStream.reclaimObject();
                        app.fragmentStream = null;
                    }
                    else if (stream.length() < app.currMsgLen && stream.length() > 0) {
                        app.writeFragmentMessage(app.FragmentDataTypes.FRAGMENT_DATA_MESSAGE_BODY, stream, app.currMsgLen);
                        break;
                    }
                    else {
                        let wpos = stream.wpos;
                        let rpos = stream.rpos + msglen;
                        stream.wpos = rpos;
                        msgHandler.handleMessage(stream);
                        stream.wpos = wpos;
                        stream.rpos = rpos;
                    }

                    app.currMsgID = 0;
                    app.currMsgLen = 0;
                }
                else {
                    if (app.mergeFragmentMessage(stream))
                        break;
                }
            }
        }

        writeFragmentMessage(FragmentDataType: number, stream: MemoryStream, datasize: number) {
            if (!(stream instanceof MemoryStream)) {
                ERROR_MSG("writeFragmentMessage(): stream must be MemoryStream instances!");
                return;
            }

            let app = KBEngineapp;
            let opsize = stream.length();

            app.fragmentDatasRemain = datasize - opsize;
            app.fragmentDatasFlag = FragmentDataType;

            if (opsize > 0) {
                KBEngineapp.fragmentStream = createMemoryObject();
                KBEngineapp.fragmentStream.append(stream, stream.rpos, opsize);
                stream.done();
            }
        }

        mergeFragmentMessage(stream: MemoryStream) {
            if (!(stream instanceof MemoryStream)) {
                ERROR_MSG("mergeFragmentMessage(): stream must be MemoryStream instances!");
                return false;
            }

            let opsize = stream.length();
            if (opsize == 0)
                return false;

            let app = KBEngineapp;
            let fragmentStream = app.fragmentStream;
            console.assert(fragmentStream != null);

            if (opsize >= app.fragmentDatasRemain) {
                let FragmentDataTypes = app.FragmentDataTypes;
                fragmentStream.append(stream, stream.rpos, app.fragmentDatasRemain);
                stream.rpos += app.fragmentDatasRemain;

                switch (app.fragmentDatasFlag) {
                    case FragmentDataTypes.FRAGMENT_DATA_MESSAGE_ID:
                        app.currMsgID = fragmentStream.readUint16();
                        break;

                    case FragmentDataTypes.FRAGMENT_DATA_MESSAGE_LENGTH:
                        app.currMsgLen = fragmentStream.readUint16();
                        break;

                    case FragmentDataTypes.FRAGMENT_DATA_MESSAGE_LENGTH1:
                        app.currMsgLen = fragmentStream.readUint32();
                        break;

                    case FragmentDataTypes.FRAGMENT_DATA_MESSAGE_BODY:
                    default:
                        break;
                }

                app.fragmentDatasFlag = FragmentDataTypes.FRAGMENT_DATA_UNKNOW;
                app.fragmentDatasRemain = 0;
                return false;
            }
            else {
                fragmentStream.append(stream, stream.rpos, opsize);
                app.fragmentDatasRemain -= opsize;
                stream.done();
                return true;
            }
        }

        onclose() {
            INFO_MSG('connect close:' + KBEngineapp.currserver);

            if (KBEngineapp.currconnect != KBEngineapp.currserver)
                return;

            KBEngineapp.resetSocket();
            KBEngineapp.netEvent.emit(EventTypes.onDisconnected);
        }

        /**
         * CONNECTING：值为0，表示正在连接。
         * OPEN：值为1，表示连接成功，可以通信了。
         * CLOSING：值为2，表示连接正在关闭。
         * CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
         * @param msg 
         */
        send(msg: ArrayBuffer) {
            if(KBEngineapp.socket) {
                if(KBEngineapp.socket.readyState === WebSocket.OPEN) { // 已经链接并且可以通讯
                    KBEngineapp.socket.send(msg);
                }
                else if(KBEngineapp.socket.readyState !== WebSocket.CONNECTING) {
                    KBEngineapp.netEvent.emit(EventTypes.onDisconnected);
                    this.close();
                }
            }
            else {
                KBEngineapp.netEvent.emit(EventTypes.onDisconnected);
            }
        }

        close() {
            INFO_MSG('KBEngine::close()');
            KBEngineapp?.reset();
        }

        update() {
            if (!KBEngineapp || !KBEngineapp.socket) {
                return;
            }

            let currentTime = Date.now();
            if (KBEngineapp.args.serverHeartbeatTick > 0 && (currentTime - KBEngineapp.lastTickTime) >= KBEngineapp.args.serverHeartbeatTick) {
                // console.log('heart beat:', currentTime - KBEngineapp.lastTickTime);
                // 如果心跳回调接收时间小于心跳发送时间，说明没有收到回调
                // 此时应该通知客户端掉线了
                if (KBEngineapp.lastTickCBTime < KBEngineapp.lastTickTime) {
                    ERROR_MSG("sendTick: Receive appTick timeout!");
                    KBEngineapp.socket.close();
                }

                if (KBEngineapp.currserver === "loginapp") {
                    if (KBEMessages.Loginapp_onClientActiveTick) {
                        let bundle = createBundleObject();
                        bundle.newMessage(KBEMessages.Loginapp_onClientActiveTick);
                        bundle.send(KBEngineapp);
                    }
                }
                else {
                    if (KBEMessages.Baseapp_onClientActiveTick) {
                        let bundle = createBundleObject();
                        bundle.newMessage(KBEMessages.Baseapp_onClientActiveTick);
                        bundle.send(KBEngineapp);
                    }
                }
                if(KBEngineapp) {
                    KBEngineapp.lastTickTime = currentTime;
                }
            }
            if(KBEngineapp) {
                KBEngineapp.updatePlayerToServer();
            }
        }

        /*
            服务器心跳回调
        */
        Client_onAppActiveTickCB() {
            KBEngineapp.lastTickCBTime = Date.now();
            KBEngineapp.netEvent.emit(EventTypes.onTickCB, (KBEngineapp.lastTickCBTime - KBEngineapp.lastTickTime) * 0.5);
            // console.log('latency:', (KBEngineapp.lastTickCBTime - KBEngineapp.lastTickTime) * 0.5, KBEngineapp.lastTickCBTime);
        }

        /*
            通过错误id得到错误描述
        */
        serverErr(id: number) {
            let e = KBEngineapp.serverErrs[id];

            if (!e) {
                return "";
            }

            return e.name + " [" + e.descr + "]";
        }

        /*
            服务端错误描述导入了
        */
        Client_onImportServerErrorsDescr(stream: MemoryStream) {
            let size = stream.readUint16();
            while (size > 0) {
                size--;

                let e = new ServerErr();
                e.id = stream.readUint16();
                e.name = UTF8ArrayToString(stream.readBlob());
                e.descr = UTF8ArrayToString(stream.readBlob());

                KBEngineapp.serverErrs[e.id] = e;

                // INFO_MSG("Client_onImportServerErrorsDescr: id=" + e.id + ", name=" + e.name + ", descr=" + e.descr);
            }
        }

        Client_onImportClientSDK(stream: MemoryStream) {
            let remainingFiles = stream.readInt32();
            let fileName = stream.readString();
            let fileSize = stream.readInt32();
            let fileDatas = stream.readBlob()
            KBEngineapp.netEvent.emit("onImportClientSDK", remainingFiles, fileName, fileSize, fileDatas);
        }

        /**
         * 当和LoginApp连接成功后走到这里
         */
        onOpenLoginapp_login() {
            INFO_MSG("KBEngineApp::onOpenLoginapp_login: successfully!");
            KBEngineapp.netEvent.emit(EventTypes.onConnectionState, true);
            // 设置当前连接的服务器
            KBEngineapp.currserver = "loginapp";
            // 设置当前状态
            KBEngineapp.currstate = "login";

            if (!KBEngineapp.loginappMessageImported) {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_importClientMessages);
                bundle.send(KBEngineapp);
                // 指定当从服务器接受到信息时的回调函数
                KBEngineapp.socket.onmessage = KBEngineapp.Client_onImportClientMessages;
                INFO_MSG("KBEngineApp::onOpenLoginapp_login: start importClientMessages ...");
            }
            else {
                KBEngineapp.onImportClientMessagesCompleted();
            }
        }

        onOpenLoginapp_createAccount() {
            KBEngineapp.netEvent.emit(EventTypes.onConnectionState, true);
            INFO_MSG("KBEngineApp::onOpenLoginapp_createAccount: successfully!");
            KBEngineapp.currserver = "loginapp";
            KBEngineapp.currstate = "createAccount";

            if (!KBEngineapp.loginappMessageImported) {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_importClientMessages);
                bundle.send(KBEngineapp);
                KBEngineapp.socket.onmessage = KBEngineapp.Client_onImportClientMessages;
                INFO_MSG("KBEngineApp::onOpenLoginapp_createAccount: start importClientMessages ...");
            }
            else {
                KBEngineapp.onImportClientMessagesCompleted();
            }
        }

        onImportClientMessagesCompleted() {
            INFO_MSG("KBEngineApp::onImportClientMessagesCompleted: successfully!");
            KBEngineapp.socket.onmessage = KBEngineapp.onmessage;
            KBEngineapp.hello();

            if (KBEngineapp.currserver == "loginapp") {
                if (!KBEngineapp.serverErrorsDescrImported) {
                    INFO_MSG("KBEngine::onImportClientMessagesCompleted(): send importServerErrorsDescr!");
                    KBEngineapp.serverErrorsDescrImported = true;
                    let bundle = createBundleObject();
                    bundle.newMessage(KBEMessages.Loginapp_importServerErrorsDescr);
                    bundle.send(KBEngineapp);
                }

                if (KBEngineapp.currstate == "login") {
                    KBEngineapp.login_loginapp(false);
                }
                else if (KBEngineapp.currstate == "resetpassword") {
                    KBEngineapp.resetpassword_loginapp(false);
                }
                else {
                    KBEngineapp.createAccount_loginapp(false);
                }

                KBEngineapp.loginappMessageImported = true;
            }
            else {
                KBEngineapp.baseappMessageImported = true;

                if (!KBEngineapp.entitydefImported) {
                    INFO_MSG("KBEngineApp::onImportClientMessagesCompleted: start importEntityDef ...");
                    let bundle = createBundleObject();
                    bundle.newMessage(KBEMessages.Baseapp_importClientEntityDef);
                    bundle.send(KBEngineapp);
                    KBEngineapp.netEvent.emit("Baseapp_importClientEntityDef");
                }
                else {
                    KBEngineapp.onImportEntityDefCompleted();
                }
            }
        }

        createDataTypeFromStreams(stream: MemoryStream, canprint: boolean) {
            let aliassize = stream.readUint16();
            // INFO_MSG("KBEngineApp::createDataTypeFromStreams: importAlias(size=" + aliassize + ")!");

            while (aliassize > 0) {
                aliassize--;
                KBEngineapp.createDataTypeFromStream(stream, canprint);
            };

            for (let datatype in KBEngineDatatypes) {
                if (KBEngineDatatypes[datatype]) {
                    KBEngineDatatypes[datatype].bind();
                }
            }
        }

        /**
         * 将数据类型和类型id建立映射关系
         * @param stream 
         * @param canprint 
         */
        createDataTypeFromStream(stream: MemoryStream, canprint: boolean) {
            let utype = stream.readUint16();
            let name = stream.readString();
            let valname = stream.readString();

            /* 有一些匿名类型，我们需要提供一个唯一名称放到datatypes中
                如：
                <onRemoveAvatar>
                    <Arg>	ARRAY <of> INT8 </of>		</Arg>
                </onRemoveAvatar>
            */
            if (valname.length === 0) {
                console.warn(`createDataTypeFromStream valname is empty. name: ${name}`);
                valname = `Null_${utype}`;
            }

            // if (canprint)
                // INFO_MSG("KBEngineApp::Client_onImportClientEntityDef: importAlias(" + name + ":" + valname + ")!");

            if (name === "FIXED_DICT") {
                let datatype = new DATATYPE_FIXED_DICT();
                let keysize = stream.readUint8();
                datatype.implementedBy = stream.readString();

                while (keysize > 0) {
                    keysize--;

                    let keyname = stream.readString();
                    let keyutype = stream.readUint16();
                    datatype.dicttype[keyname] = keyutype;
                }

                KBEngineDatatypes[valname] = datatype;
            }
            else if (name == "ARRAY") {
                let uitemtype = stream.readUint16();
                let datatype = new DATATYPE_ARRAY();
                datatype.type = KBEngineDatatypes[uitemtype];
                KBEngineDatatypes[valname] = datatype;
            }
            else if(name === 'ENTITY_COMPONENT') {
                valname = `Component_${utype}`;
                KBEngineDatatypes[valname] = new DATA_COMPONENT();
            }
            else {
                KBEngineDatatypes[valname] = KBEngineDatatypes[name];
            }

            KBEngineDatatypes[utype] = KBEngineDatatypes[valname];

            // 将用户自定义的类型补充到映射表中
            datatype2id[valname] = utype;
        }

        Client_onImportClientEntityDef(stream: MemoryStream) {
            KBEngineapp.createDataTypeFromStreams(stream, true);

            while (stream.length() > 0) {
                let scriptmodule_name = stream.readString();
                let scriptUtype = stream.readUint16();
                let propertysize = stream.readUint16();
                let clientMethodSize = stream.readUint16();
                let baseMethodsize = stream.readUint16();
                let cellMethodsize = stream.readUint16();
                // INFO_MSG("KBEngineApp::Client_onImportClientEntityDef: import(" + scriptmodule_name + "), propertys(" + propertysize + "), " +
                //     "clientMethods(" + clientMethodSize + "), baseMethods(" + baseMethodsize + "), cellMethods(" + cellMethodsize + ")!");

                let currModuleDefs = new Module();
                moduleDefs.set(scriptmodule_name, currModuleDefs);
                currModuleDefs.name = scriptmodule_name;
                currModuleDefs.propertys = Object.create(null);
                currModuleDefs.aliasID2Properties = Object.create(null);
                currModuleDefs.clientMethods = Object.create(null);
                currModuleDefs.baseMethods = Object.create(null);
                currModuleDefs.cellMethods = Object.create(null);
                idModuleDefs.set(scriptUtype, currModuleDefs);


                let self_aliasID2Properties = currModuleDefs.aliasID2Properties;
                let self_propertys = currModuleDefs.propertys;
                let clientMethods = currModuleDefs.clientMethods;
                let self_base_methods = currModuleDefs.baseMethods;
                let self_cell_methods = currModuleDefs.cellMethods;

                let Class = KBEallModules[scriptmodule_name];
                if (!Class) {
                    ERROR_MSG("KBEngineApp::Client_onImportClientEntityDef: module(" + scriptmodule_name + ") not found!");
                    return;
                }
                // 解析Properties
                while (propertysize > 0) {
                    propertysize--;
                    
                    let properUtype = stream.readUint16();
                    let properFlags = stream.readUint32();
                    let aliasID = stream.readInt16();
                    let propMethodName = stream.readString();
                    let defaultValStr = stream.readString();
                    let _t = stream.readUint16();
                    let utype = KBEngineDatatypes[_t];
                    let setmethod = Class.prototype[`set_${propMethodName}`];

                    let savedata = new Property(properUtype, aliasID, propMethodName, defaultValStr, utype, setmethod, properFlags);

                    self_propertys[propMethodName] = savedata;

                    // 服务端调用客户端的方法，为了节省流量，所有用aliasID来指明调用的是哪个方法
                    if (aliasID !== -1) {
                        self_aliasID2Properties[aliasID] = savedata;
                        currModuleDefs["usePropertyDescrAlias"] = true;
                    }
                    else {
                        self_aliasID2Properties[properUtype] = savedata;
                        currModuleDefs["usePropertyDescrAlias"] = false;
                    }
                }

                // 解析ClientMethods
                while (clientMethodSize > 0) {
                    clientMethodSize--;

                    let methodUtype = stream.readUint16();
                    let aliasID = stream.readInt16();
                    let methodName = stream.readString();
                    let argssize = stream.readUint8();
                    let args = [];

                    // 读取方法参数类型
                    while (argssize > 0) {
                        argssize--;
                        args.push(KBEngineDatatypes[stream.readUint16()]);
                    };

                    let savedata = new Method(methodUtype, aliasID, methodName, args);
                    clientMethods[methodName] = savedata;

                    // 服务端调用客户端的方法，为了节省流量，所有用aliasID来指明调用的是哪个方法
                    if (aliasID !== -1) {
                        clientMethods[aliasID] = savedata;
                        currModuleDefs.useMethodDescrAlias = true;
                    }
                    else {
                        clientMethods[methodUtype] = savedata;
                        currModuleDefs.useMethodDescrAlias = false;
                    }
                }

                // 解析BaseMethods
                while (baseMethodsize > 0) {
                    baseMethodsize--;

                    let methodUtype = stream.readUint16();
                    let aliasID = stream.readInt16();
                    let baseMethodName = stream.readString();
                    let argssize = stream.readUint8();
                    let args = [];

                    while (argssize > 0) {
                        argssize--;
                        args.push(KBEngineDatatypes[stream.readUint16()]);
                    }
                    // 是用客户端调用服务端的方法，用户不指定方法的aliasID
                    self_base_methods[baseMethodName] = new Method(methodUtype, aliasID, baseMethodName, args);
                }

                // 解析CellMethods
                while (cellMethodsize > 0) {
                    cellMethodsize--;

                    let methodUtype = stream.readUint16();
                    let aliasID = stream.readInt16();
                    let cellMethodName = stream.readString();
                    let argssize = stream.readUint8();
                    let args = [];

                    while (argssize > 0) {
                        argssize--;
                        args.push(KBEngineDatatypes[stream.readUint16()]);
                    };

                    self_cell_methods[cellMethodName] = new Method(methodUtype, aliasID, cellMethodName, args);
                }

                // 给属性设置默认值
                for (let key in currModuleDefs.propertys) {
                    let infos = currModuleDefs.propertys[key];
                    let utype = infos.utype;

                    if (utype) {
                        // @ts-ignore
                        Class.defaultValues.set(infos.name, utype.parseDefaultValStr(infos.defaultValStr));
                    }
                }

                // 检测客户端是否实现了ClientMethods中的方法
                for (let key in currModuleDefs.clientMethods) {
                    let infos = currModuleDefs.clientMethods[key];
                    if (!Class.prototype[infos.methodName]) {
                        WARNING_MSG(scriptmodule_name + ":: method(" + infos.methodName + ") not implement!");
                    }
                }
            }

            KBEngineapp.onImportEntityDefCompleted();
        }

        Client_onVersionNotMatch(stream: MemoryStream) {
            KBEngineapp.serverVersion = stream.readString();
            ERROR_MSG("Client_onVersionNotMatch: verInfo=" + KBEngineapp.clientVersion + " not match(server: " + KBEngineapp.serverVersion + ")");
            KBEngineapp.netEvent.emit(EventTypes.onVersionNotMatch, KBEngineapp.clientVersion, KBEngineapp.serverVersion);
        }

        Client_onScriptVersionNotMatch(stream: MemoryStream) {
            KBEngineapp.serverScriptVersion = stream.readString();
            ERROR_MSG("Client_onScriptVersionNotMatch: verInfo=" + KBEngineapp.clientScriptVersion + " not match(server: " + KBEngineapp.serverScriptVersion + ")");
            KBEngineapp.netEvent.emit(EventTypes.onScriptVersionNotMatch, KBEngineapp.clientScriptVersion, KBEngineapp.serverScriptVersion);
        }

        onImportEntityDefCompleted() {
            INFO_MSG("KBEngineApp::onImportEntityDefCompleted: successfully!");
            KBEngineapp.entitydefImported = true;
            KBEngineapp.login_baseapp(false);
        }

        importClientMessages(stream: MemoryStream) {
            let app = KBEngineapp;

            while (app.currMsgCount > 0) {
                app.currMsgCount--;

                let msgid = stream.readUint16();
                let msglen = stream.readInt16();
                let msgname = stream.readString();
                let argtype = stream.readInt8();
                let argsize = stream.readUint8();
                let argstypes = new Array(argsize);

                for (let i = 0; i < argsize; i++) {
                    argstypes[i] = stream.readUint8();
                }

                let handler: Function | null = null;
                let isClientMethod = msgname.indexOf("Client_") >= 0;
                if (isClientMethod) {
                    handler = app[msgname];
                    if (!handler) {
                        WARNING_MSG("KBEngineApp::onImportClientMessages[" + app.currserver + "]: interface(" + msgname + "/" + msgid + ") no implement!");
                        handler = null;
                    }
                    else {
                        // INFO_MSG("KBEngineApp::onImportClientMessages: import(" + msgname + ") successfully!");
                    }
                }

                if (msgname.length > 0) {
                    KBEMessages[msgname] = new Message(msgid, msgname, msglen, argtype, argstypes, handler);

                    if (isClientMethod) {
                        KBEClientMessages[msgid] = KBEMessages[msgname];
                    }
                    else {
                        KBEMessages[KBEngineapp.currserver][msgid] = KBEMessages[msgname];
                    }
                }
                else {
                    KBEMessages[app.currserver][msgid] = new Message(msgid, msgname, msglen, argtype, argstypes, handler);
                }
            };

            app.onImportClientMessagesCompleted();
            app.currMsgID = 0;
            app.currMsgLen = 0;
            app.currMsgCount = 0;
            app.fragmentStream = null;
        }

        Client_onImportClientMessages(msg: MessageEvent) {
            let stream = new MemoryStream(msg.data);
            stream.wpos = msg.data.byteLength;
            let app = KBEngineapp;

            if (app.currMsgID === 0) {
                app.currMsgID = stream.readUint16();
            }

            if (app.currMsgID == KBEMessages.onImportClientMessages.id) {
                if (app.currMsgLen == 0) {
                    app.currMsgLen = stream.readUint16();
                    app.currMsgCount = stream.readUint16();
                }

                let FragmentDataTypes = app.FragmentDataTypes
                if (stream.length() + 2 < app.currMsgLen && app.fragmentStream == null) {
                    app.writeFragmentMessage(FragmentDataTypes.FRAGMENT_DATA_MESSAGE_BODY, stream, app.currMsgLen - 2);
                }
                else if (app.fragmentStream != null) {
                    app.mergeFragmentMessage(stream);

                    if (app.fragmentStream.length() + 2 >= app.currMsgLen) {
                        app.importClientMessages(app.fragmentStream);
                    }
                }
                else {
                    app.importClientMessages(stream);
                }
            }
            else {
                ERROR_MSG("KBEngineApp::onmessage: not found msg(" + app.currMsgID + ")!");
            }
        }

        createAccount(username: string, password: string, datas: any) {
            KBEngineapp.reset();
            KBEngineapp.username = username;
            KBEngineapp.password = password;
            KBEngineapp.clientdatas = datas;

            KBEngineapp.createAccount_loginapp(true);
        }

        /**
         * 拿到服务端地址，默认是ws://ip:port格式，但是有的环境需要wss协议的地址
         * wss的地址需要自己填在KBEngineArgs对象里面。loginAddr就是连接到登录服务器的wss地址
         * baseAddr就是连到baseApp服务器的地址。
         * @param ip 
         * @param port 
         */
        getServerAddr(ip: string, port: number) {
            let serverAddr: string;
            if (KBEngineapp.args.domain && KBEngineapp.args.domain.length > 0) {
                if (KBEngineapp.currconnect === 'loginapp') {
                    serverAddr = KBEngineapp.args.loginAddr;
                } 
                else if(KBEngineapp.currconnect === 'baseapp') {
                    serverAddr = KBEngineapp.args.baseAddr + port;
                }
            } 
            else {
                serverAddr = `ws://${ip}:${port}`;
            }
            return serverAddr;
        }

        createAccount_loginapp(noconnect: boolean) {
            if (noconnect) {
                KBEngineapp.currconnect = "loginapp";
                let serverAddr = this.getServerAddr(KBEngineapp.ip, KBEngineapp.port);
                INFO_MSG("KBEngineApp::createAccount_loginapp: start connect to " + serverAddr + "!");
                //这里需要调整
                KBEngineapp.connect(serverAddr);
                KBEngineapp.socket.onopen = KBEngineapp.onOpenLoginapp_createAccount;
            }
            else {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_reqCreateAccount);
                bundle.writeString(KBEngineapp.username);
                bundle.writeString(KBEngineapp.password);
                bundle.writeBlob(KBEngineapp.clientdatas);
                bundle.send(KBEngineapp);
            }
        }

        bindAccountEmail(emailAddress: string) {
            let bundle = createBundleObject();
            bundle.newMessage(KBEMessages.Baseapp_reqAccountBindEmail);
            bundle.writeInt32(KBEngineapp.entity_id);
            bundle.writeString(KBEngineapp.password);
            bundle.writeString(emailAddress);
            bundle.send(KBEngineapp);
        }

        newPassword(old_password: string, new_password: string) {
            let bundle = createBundleObject();
            bundle.newMessage(KBEMessages.Baseapp_reqAccountNewPassword);
            bundle.writeInt32(KBEngineapp.entity_id);
            bundle.writeString(old_password);
            bundle.writeString(new_password);
            bundle.send(KBEngineapp);
        }

        login(username: string, password: string, datas: string) {
            KBEngineapp.reset();
            KBEngineapp.username = username;
            KBEngineapp.password = password;
            KBEngineapp.clientdatas = datas;

            KBEngineapp.login_loginapp(true);
        }

        logout() {
            let bundle = createBundleObject();
            bundle.newMessage(KBEMessages.Baseapp_logoutBaseapp);
            bundle.writeUint64(KBEngineapp.entity_uuid);
            bundle.writeInt32(KBEngineapp.entity_id);
            bundle.send(KBEngineapp);
        }

        /**
         * 登录到loginApp
         * @param noconnect 是否建立了连接，如果没则先建立连接。当建立连接，服务端下发了协议后再发送帐号密码到loginApp走帐号验证流程。
         */
        login_loginapp(noconnect: boolean) {
            if (noconnect) {
                KBEngineapp.currconnect = "loginapp";
                let serverAddr = this.getServerAddr(KBEngineapp.ip, KBEngineapp.port);
                INFO_MSG("KBEngineApp::login_loginapp: start connect to " + serverAddr + "!");
                KBEngineapp.connect(serverAddr);
                // 重定向连接成功后的方法
                KBEngineapp.socket.onopen = KBEngineapp.onOpenLoginapp_login;
            }
            else {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_login);
                bundle.writeInt8(KBEngineapp.args.clientType); // clientType
                bundle.writeBlob(KBEngineapp.clientdatas);
                bundle.writeString(KBEngineapp.username);
                bundle.writeString(KBEngineapp.password);
                bundle.send(KBEngineapp);
            }
        }

        onOpenLoginapp_resetpassword() {
            INFO_MSG("KBEngineApp::onOpenLoginapp_resetpassword: successfully!");
            KBEngineapp.currserver = "loginapp";
            KBEngineapp.currstate = "resetpassword";

            if (!KBEngineapp.loginappMessageImported) {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_importClientMessages);
                bundle.send(KBEngineapp);
                KBEngineapp.socket.onmessage = KBEngineapp.Client_onImportClientMessages;
                INFO_MSG("KBEngineApp::onOpenLoginapp_resetpassword: start importClientMessages ...");
            }
            else {
                KBEngineapp.onImportClientMessagesCompleted();
            }
        }

        resetPassword(username: string) {
            KBEngineapp.reset();
            KBEngineapp.username = username;
            KBEngineapp.resetpassword_loginapp(true);
        }

        resetpassword_loginapp(noconnect: boolean) {
            if (noconnect) {
                KBEngineapp.currconnect = "loginapp";
                let serverAddr = this.getServerAddr(KBEngineapp.ip, KBEngineapp.port);
                INFO_MSG("KBEngineApp::resetpassword_loginapp: start connect to " + serverAddr + "!");
                KBEngineapp.connect(serverAddr);
                
                KBEngineapp.socket.onopen = KBEngineapp.onOpenLoginapp_resetpassword;
            }
            else {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Loginapp_reqAccountResetPassword);
                bundle.writeString(KBEngineapp.username);
                bundle.send(KBEngineapp);
            }
        }

        onOpenBaseapp() {
            INFO_MSG("KBEngineApp::onOpenBaseapp: successfully!");
            KBEngineapp.currserver = "baseapp";

            if (!KBEngineapp.baseappMessageImported) {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Baseapp_importClientMessages);
                bundle.send(KBEngineapp);
                KBEngineapp.socket.onmessage = KBEngineapp.Client_onImportClientMessages;
                KBEngineapp.netEvent.emit("Baseapp_importClientMessages");
            }
            else {
                KBEngineapp.onImportClientMessagesCompleted();
            }
        }

        login_baseapp(noconnect: boolean) {
            if (noconnect) {
                KBEngineapp.netEvent.emit(EventTypes.onLoginBaseapp);
                KBEngineapp.currconnect = "baseapp";
                let serverAddr = this.getServerAddr(KBEngineapp.baseappIP, KBEngineapp.baseappTcpPort);
                INFO_MSG("KBEngineApp::login_baseapp: start connect to " + serverAddr + "!");
                KBEngineapp.connect(serverAddr);

                if (KBEngineapp.socket) {
                    KBEngineapp.socket.onopen = KBEngineapp.onOpenBaseapp;
                }
            }
            else {
                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Baseapp_loginBaseapp);
                bundle.writeString(KBEngineapp.username);
                bundle.writeString(KBEngineapp.password);
                bundle.send(KBEngineapp);
            }
        }

        reloginBaseapp() {
            KBEngineapp.lastTickTime = Date.now();
            KBEngineapp.lastTickCBTime = KBEngineapp.lastTickTime;

            if (KBEngineapp.socket) {
                return;
            }

            KBEngineapp.resetSocket();
            KBEngineapp.netEvent.emit(EventTypes.onReloginBaseapp);

            KBEngineapp.currconnect = "baseapp";
            let serverAddr = this.getServerAddr(KBEngineapp.baseappIP, KBEngineapp.baseappTcpPort);
            INFO_MSG("KBEngineApp::reloginBaseapp: start connect to " + serverAddr + "!");
            KBEngineapp.connect(serverAddr);

            if (KBEngineapp.socket) {
                KBEngineapp.socket.onopen = KBEngineapp.onReOpenBaseapp;
            }
        }

        onReOpenBaseapp() {
            INFO_MSG("KBEngineApp::onReOpenBaseapp: successfully!");
            KBEngineapp.currserver = "baseapp";

            let bundle = createBundleObject();
            bundle.newMessage(KBEMessages.Baseapp_reloginBaseapp);
            bundle.writeString(KBEngineapp.username);
            bundle.writeString(KBEngineapp.password);
            bundle.writeUint64(KBEngineapp.entity_uuid);
            bundle.writeInt32(KBEngineapp.entity_id);
            bundle.send(KBEngineapp);

            KBEngineapp.lastTickCBTime = Date.now();
        }

        Client_onHelloCB(args: MemoryStream) {
            KBEngineapp.serverVersion = args.readString();
            KBEngineapp.serverScriptVersion = args.readString();
            KBEngineapp.serverProtocolMD5 = args.readString();
            KBEngineapp.serverEntityDefMD5 = args.readString();

            let ctype = args.readInt32();

            INFO_MSG("KBEngineApp::Client_onHelloCB: verInfo(" + KBEngineapp.serverVersion + "), scriptVerInfo(" +
                KBEngineapp.serverScriptVersion + "), serverProtocolMD5(" + KBEngineapp.serverProtocolMD5 + "), serverEntityDefMD5(" +
                KBEngineapp.serverEntityDefMD5 + "), ctype(" + ctype + ")!");

            KBEngineapp.lastTickCBTime = Date.now();
        }

        Client_onLoginFailed(args: MemoryStream) {
            let failedcode = args.readUint16();
            KBEngineapp.serverdatas = args.readBlob();
            ERROR_MSG("KBEngineApp::Client_onLoginFailed: failedcode=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + "), datas(" + KBEngineapp.serverdatas.length + ")!");
            KBEngineapp.netEvent.emit(EventTypes.onLoginFailed, failedcode, KBEngineapp.serverdatas);
        }

        Client_onLoginSuccessfully(args: MemoryStream) {
            let accountName = args.readString();
            KBEngineapp.username = accountName;
            KBEngineapp.baseappIP = args.readString();
            KBEngineapp.baseappTcpPort = args.readUint16();
            KBEngineapp.baseappUdpPort = args.readUint16();
            KBEngineapp.serverdatas = args.readBlob();

            INFO_MSG("KBEngineApp::Client_onLoginSuccessfully: accountName(" + accountName + "), addr(" +
                KBEngineapp.baseappIP + ":" + KBEngineapp.baseappTcpPort + ":" + KBEngineapp.baseappUdpPort + "), datas(" + KBEngineapp.serverdatas.length + ")!");

            KBEngineapp.disconnect();
            KBEngineapp.login_baseapp(true);
        }

        Client_onLoginBaseappFailed(failedcode: number) {
            ERROR_MSG("KBEngineApp::Client_onLoginBaseappFailed: failedcode=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
            KBEngineapp.netEvent.emit(EventTypes.onLoginBaseappFailed, failedcode);
        }

        Client_onReloginBaseappFailed(failedcode: number) {
            ERROR_MSG("KBEngineApp::Client_onReloginBaseappFailed: failedcode=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
            KBEngineapp.netEvent.emit(EventTypes.onReloginBaseappFailed, failedcode);
        }

        Client_onReloginBaseappSuccessfully(stream: MemoryStream) {
            KBEngineapp.entity_uuid = stream.readUint64();
            DEBUG_MSG("KBEngineApp::Client_onReloginBaseappSuccessfully: " + KBEngineapp.username);
            KBEngineapp.netEvent.emit(EventTypes.onReloginBaseappSuccessfully);
        }

        entityClass = Object.create(null);
        getEntityClass(entityType: string) {
            let runClass = KBEngineapp.entityClass[entityType];
            if (!runClass) {
                //组件适配
                runClass = KBEallModules[entityType];
                if (!runClass) {
                    ERROR_MSG("KBEngineApp::getentityclass: entityType(" + entityType + ") is error!");
                    return runClass;
                }
                else {
                    KBEngineapp.entityClass[entityType] = runClass;
                }
            }

            return runClass;
        }

        Client_onCreatedProxies(rndUUID: UINT64, eid: number, entityType: string) {
            console.log("KBEngineApp::Client_onCreatedProxies: eid(" + eid + "), entityType(" + entityType + ")!");

            KBEngineapp.entity_uuid = rndUUID;
            KBEngineapp.entity_id = eid;
            
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                let runclass = KBEngineapp.getEntityClass(entityType);
                if (!runclass) {
                    return;
                }
                // let moduleDefs = moduleDefs.get(entity.className);
                let entity: Entity = new runclass();
                entity.id = eid;
                entity.className = entityType;

                entity.base = new EntityCall();
                entity.base.id = eid;
                entity.base.className = entityType;
                entity.base.type = ENTITYCALL_TYPE_BASE;
                entity.resetDefaultValues();

                KBEngineapp.entities[eid] = entity;

                let entityMessage = this.bufferedCreateEntityMessage[eid];
                if (entityMessage) {
                    KBEngineapp.Client_onUpdatePropertys(entityMessage);
                    delete this.bufferedCreateEntityMessage[eid];
                }

                entity.__init__();

                if (KBEngineapp.args.isOnInitCallPropertysSetMethods) {
                    entity.callPropertysSetMethods();
                }
                //组件适配：设置组件
                entity.setComponents(moduleDefs.get(entity.className));
            }
            else {
                let entityMessage = this.bufferedCreateEntityMessage[eid];
                if (entityMessage) {
                    KBEngineapp.Client_onUpdatePropertys(entityMessage);
                    delete this.bufferedCreateEntityMessage[eid];
                }
            }
        }

        getViewEntityIDFromStream(stream: MemoryStream) {
            let id = 0;
            if (KBEngineapp.entityIDAliasIDList.length > 255) {
                id = stream.readInt32();
            }
            else {
                let aliasID = stream.readUint8();

                // 如果为0且客户端上一步是重登陆或者重连操作并且服务端entity在断线期间一直处于在线状态
                // 则可以忽略这个错误, 因为cellapp可能一直在向baseapp发送同步消息， 当客户端重连上时未等
                // 服务端初始化步骤开始则收到同步信息, 此时这里就会出错。
                if (KBEngineapp.entityIDAliasIDList.length <= aliasID)
                    return 0;

                id = KBEngineapp.entityIDAliasIDList[aliasID];
            }

            return id;
        }

        onUpdateProperties(eid: number, stream: MemoryStream) {
            let entity = KBEngineapp.entities[eid];

            if (!entity) {
                let entityMessage = this.bufferedCreateEntityMessage[eid];
                if (entityMessage) {
                    ERROR_MSG("KBEngineApp::Client_onUpdatePropertys: entity(" + eid + ") not found!");
                    return;
                }

                let stream1 = new MemoryStream(stream.buffer);
                stream1.wpos = stream.wpos;
                stream1.rpos = stream.rpos - 4;
                this.bufferedCreateEntityMessage[eid] = stream1;
                return;
            }

            let currModule = moduleDefs.get(entity.className);
            let pdatas = currModule.aliasID2Properties;
            let utype = 0;
            let childUtype = 0;
            //适配组件：更新实体属性、组件属性
            while (stream.length() > 0) {
                if (currModule.usePropertyDescrAlias) {
                    utype = stream.readUint8();
                    childUtype = stream.readUint8();
                }
                else {
                    utype = stream.readUint16();
                    childUtype = stream.readUint16();
                }

                let prop = null;
                if(utype === 0) {
                    prop = pdatas[childUtype];
                }
                else {
                    prop = pdatas[utype];
                    if(prop.utype instanceof DATA_COMPONENT) {
                        (entity[prop.name] as Component).onUpdateProperties(childUtype, stream, -1)
                        return;
                    }
                }
                
                if(prop.utype instanceof DATA_COMPONENT) {
                    (entity[prop.name] as Component).createFromStream(stream);
                }
                else {
                    let val = prop.utype.createFromStream(stream);
                    let oldVal = entity[prop.name];
                    entity[prop.name] = val;

                    let setmethod = prop.setmethod;
                    if(setmethod) {
                        let flags = prop.properFlags;
                        if(flags === EntityDataFlags.ED_FLAG_BASE_AND_CLIENT || flags === EntityDataFlags.ED_FLAG_BASE) {
                            if(entity.inited) {
                                setmethod.call(entity, oldVal);
                            }
                        }
                        else {
                            if(entity.inWorld) {
                                setmethod.call(entity, oldVal);
                            }
                        }
                    }
                }
            }
        }

        Client_onUpdatePropertysOptimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);
            KBEngineapp.onUpdateProperties(eid, stream);
        }

        Client_onUpdatePropertys(stream: MemoryStream) {
            let eid = stream.readInt32();
            KBEngineapp.onUpdateProperties(eid, stream);
        }

        onRemoteMethodCall_(eid: number, stream: MemoryStream) {
            let entity = KBEngineapp.entities[eid];

            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onRemoteMethodCall: entity(" + eid + ") not found!");
                return;
            }

            let propertyUtype = 0;
            let methodUtype = 0;
            if (moduleDefs.get(entity.className).usePropertyDescrAlias) {
                propertyUtype = stream.readUint8();
            } 
            else {
                propertyUtype = stream.readUint16();
            }

            if (moduleDefs.get(entity.className).useMethodDescrAlias) {
                methodUtype = stream.readUint8();
            } 
            else {
                methodUtype = stream.readUint16();
            }

            if (propertyUtype === 0) {
                //实体方法
                let methoddata = moduleDefs.get(entity.className).clientMethods[methodUtype];
                if (methoddata) {
                    let args = [];
                    let argsdata = methoddata.args;
                    for (let i = 0; i < argsdata.length; i++) {
                        args.push(argsdata[i].createFromStream(stream));
                    }
                    entity[methoddata.methodName].apply(entity, args)
                }
            } 
            else {
                //实体组件方法
                let comName = moduleDefs.get(entity.className).aliasID2Properties[propertyUtype].name;
                let comObj = entity[comName]
                let methoddata = moduleDefs.get(comObj.className).clientMethods[methodUtype]
                let args = [];
                let argsdata = methoddata.args;
                for (let i = 0; i < argsdata.length; i++) {
                    args.push(argsdata[i].createFromStream(stream));
                }
                comObj[methoddata.methodName].apply(comObj, args);
            }
        }

        Client_onRemoteMethodCallOptimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);
            KBEngineapp.onRemoteMethodCall_(eid, stream);
        }

        Client_onRemoteMethodCall(stream: MemoryStream) {
            let eid = stream.readInt32();
            KBEngineapp.onRemoteMethodCall_(eid, stream);
        }

        Client_onEntityEnterWorld(stream: MemoryStream) {
            let eid = stream.readInt32();
            if (KBEngineapp.entity_id > 0 && eid != KBEngineapp.entity_id) {
                KBEngineapp.entityIDAliasIDList.push(eid);
            }

            let entityType: number | string;
            let defCount = moduleDefs.size;
            
            if (defCount > 255) {
                entityType = stream.readUint16();
            }
            else {
                entityType = stream.readUint8();
            }

            let isOnGround = 0;

            if (stream.length() > 0) {
                isOnGround = stream.readInt8();
            }

            entityType = idModuleDefs.get(entityType).name;
            INFO_MSG("KBEngineApp::Client_onEntityEnterWorld: " + entityType + "(" + eid + "), spaceID(" + KBEngineapp.spaceID + "), isOnGround(" + isOnGround + ")!");

            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                let entityMessage = this.bufferedCreateEntityMessage[eid];
                if (!entityMessage) {
                    ERROR_MSG("KBEngineApp::Client_onEntityEnterWorld: entity(" + eid + ") not found!");
                    return;
                }

                let runClass = KBEngineapp.getEntityClass(entityType);
                if (!runClass)
                    return;

                let entity: Entity = new runClass();
                entity.id = eid;
                entity.className = entityType;

                entity.cell = new EntityCall();
                entity.cell.id = eid;
                entity.cell.className = entityType;
                entity.cell.type = ENTITYCALL_TYPE_CELL;

                KBEngineapp.entities[eid] = entity;

                KBEngineapp.Client_onUpdatePropertys(entityMessage);
                delete this.bufferedCreateEntityMessage[eid];

                entity.isOnGround = isOnGround > 0;
                entity.__init__();
                entity.inited = true;
                entity.inWorld = true;
                entity.enterWorld();

                if (KBEngineapp.args.isOnInitCallPropertysSetMethods)
                    entity.callPropertysSetMethods();

                entity.set_direction(entity.direction);
                entity.set_position(entity.position);
            }
            else {
                if (!entity.inWorld) {
                    entity.cell = new EntityCall();
                    entity.cell.id = eid;
                    entity.cell.className = entityType;
                    entity.cell.type = ENTITYCALL_TYPE_CELL;

                    // 安全起见， 这里清空一下
                    // 如果服务端上使用giveClientTo切换控制权
                    // 之前的实体已经进入世界， 切换后的实体也进入世界， 这里可能会残留之前那个实体进入世界的信息
                    KBEngineapp.entityIDAliasIDList.length = 0;
                    KBEngineapp.entities = Object.create(null);
                    KBEngineapp.entities[entity.id] = entity;

                    entity.set_direction(entity.direction);
                    entity.set_position(entity.position);

                    KBEngineapp.entityServerPos.x = entity.position.x;
                    KBEngineapp.entityServerPos.y = entity.position.y;
                    KBEngineapp.entityServerPos.z = entity.position.z;

                    entity.isOnGround = isOnGround > 0;
                    entity.inWorld = true;
                    entity.enterWorld();

                    if (KBEngineapp.args.isOnInitCallPropertysSetMethods)
                        entity.callPropertysSetMethods();
                }
            }
        }

        Client_onEntityLeaveWorldOptimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);
            KBEngineapp.Client_onEntityLeaveWorld(eid);
        }

        Client_onEntityLeaveWorld(eid: number) {
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onEntityLeaveWorld: entity(" + eid + ") not found!");
                return;
            }

            if (entity.inWorld)
                entity.leaveWorld();

            if (KBEngineapp.entity_id > 0 && eid !== KBEngineapp.entity_id) {
                let newArray0 = [];

                for (let i = 0; i < KBEngineapp.controlledEntities.length; i++) {
                    if (KBEngineapp.controlledEntities[i].id !== eid) {
                        newArray0.push(KBEngineapp.controlledEntities[i]);
                    }
                    else {
                        KBEngineapp.netEvent.emit(EventTypes.onLoseControlledEntity);
                    }
                }

                KBEngineapp.controlledEntities = newArray0

                delete KBEngineapp.entities[eid];

                let newArray = [];
                for (let i = 0; i < KBEngineapp.entityIDAliasIDList.length; i++) {
                    if (KBEngineapp.entityIDAliasIDList[i] !== eid) {
                        newArray.push(KBEngineapp.entityIDAliasIDList[i]);
                    }
                }

                KBEngineapp.entityIDAliasIDList = newArray
            }
            else {
                KBEngineapp.clearSpace(false);
                entity.cell = null;
            }
        }

        Client_onEntityDestroyed(eid: number) {
            INFO_MSG("KBEngineApp::Client_onEntityDestroyed: entity(" + eid + ")!");

            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onEntityDestroyed: entity(" + eid + ") not found!");
                return;
            }

            if (entity.inWorld) {
                if (KBEngineapp.entity_id == eid)
                    KBEngineapp.clearSpace(false);

                entity.leaveWorld();
            }

            delete KBEngineapp.entities[eid];
        }

        Client_onEntityEnterSpace(stream: MemoryStream) {
            let eid = stream.readInt32();
            KBEngineapp.spaceID = stream.readUint32();
            let isOnGround = true;

            if (stream.length() > 0)
                isOnGround = !!stream.readInt8();

            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onEntityEnterSpace: entity(" + eid + ") not found!");
                return;
            }

            entity.isOnGround = isOnGround;
            KBEngineapp.entityServerPos.x = entity.position.x;
            KBEngineapp.entityServerPos.y = entity.position.y;
            KBEngineapp.entityServerPos.z = entity.position.z;
            entity.enterSpace();
        }

        Client_onEntityLeaveSpace(eid: number) {
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onEntityLeaveSpace: entity(" + eid + ") not found!");
                return;
            }

            KBEngineapp.clearSpace(false);
            entity.leaveSpace();
        }

        Client_onKicked(failedcode: number) {
            ERROR_MSG("KBEngineApp::Client_onKicked: failedcode=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
            KBEngineapp.netEvent.emit(EventTypes.onKicked, failedcode);
        }

        Client_onCreateAccountResult(stream: MemoryStream) {
            let retcode = stream.readUint16();
            let datas = stream.readBlob();

            KBEngineapp.netEvent.emit(EventTypes.onCreateAccountResult, retcode, datas);

            if (retcode !== 0) {
                ERROR_MSG("KBEngineApp::Client_onCreateAccountResult: " + KBEngineapp.username + " create is failed! code=" + retcode + "(" + KBEngineapp.serverErrs[retcode].name + "!");
                return;
            }

            INFO_MSG("KBEngineApp::Client_onCreateAccountResult: " + KBEngineapp.username + " create is successfully!");
        }

        Client_onControlEntity(eid: number, isControlled: number) {
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onControlEntity: entity(" + eid + ") not found!");
                return;
            }

            let isCont = isControlled !== 0;
            if (isCont) {
                // 如果被控制者是玩家自己，那表示玩家自己被其它人控制了
                // 所以玩家自己不应该进入这个被控制列表
                if (KBEngineapp.player().id !== entity.id) {
                    KBEngineapp.controlledEntities.push(entity)
                }
            }
            else {
                // let newArray = [];

                // for (let i = 0; i < KBEngineapp.controlledEntities.length; i++)
                //     if (KBEngineapp.controlledEntities[i] != entity.id)
                //         newArray.push(KBEngineapp.controlledEntities[i]);

                // KBEngineapp.controlledEntities = newArray;
                let index = KBEngineapp.controlledEntities.indexOf(entity);
                if (index != -1)
                    KBEngineapp.controlledEntities.splice(index, 1);
            }

            entity.isControlled = isCont;

            try {
                entity.onControlled(isCont);
                KBEngineapp.netEvent.emit(EventTypes.onControlled, entity, isCont);
            }
            catch (e) {
                ERROR_MSG("KBEngine::Client_onControlEntity: entity id = '" + eid + "', is controlled = '" + isCont + "', error = '" + e + "'");
            }
        }

        updatePlayerToServer() {
            let player = KBEngineapp.player();
            if (!player || !player.inWorld || KBEngineapp.spaceID === 0 || player.isControlled)
                return;

            if (player.entityLastLocalPos.distanceNoSqrt(player.position) > limtDistance || player.entityLastLocalDir.distanceNoSqrt(player.direction) > limtDistance) {
                // 记录玩家最后一次上报位置时自身当前的位置
                player.entityLastLocalPos.x = player.position.x;
                player.entityLastLocalPos.y = player.position.y;
                player.entityLastLocalPos.z = player.position.z;
                player.entityLastLocalDir.x = player.direction.x;
                player.entityLastLocalDir.y = player.direction.y;
                player.entityLastLocalDir.z = player.direction.z;

                let bundle = createBundleObject();
                bundle.newMessage(KBEMessages.Baseapp_onUpdateDataFromClient);
                bundle.writeFloat(player.position.x);
                bundle.writeFloat(player.position.y);
                bundle.writeFloat(player.position.z);
                bundle.writeFloat(player.direction.x);
                bundle.writeFloat(player.direction.y);
                bundle.writeFloat(player.direction.z);
                bundle.writeUint8(player.isOnGround);
                bundle.writeUint32(KBEngineapp.spaceID);
                bundle.send(KBEngineapp);
            }

            // 开始同步所有被控制了的entity的位置
            for (let eid in KBEngineapp.controlledEntities) {
                let entity = KBEngineapp.controlledEntities[eid];
                let position = entity.position;
                let direction = entity.direction;

                let posHasChanged = entity.entityLastLocalPos.distanceNoSqrt(position) > limtDistance;
                let dirHasChanged = entity.entityLastLocalDir.distanceNoSqrt(direction) > limtDistance;

                if (posHasChanged || dirHasChanged) {
                    entity.entityLastLocalPos = position;
                    entity.entityLastLocalDir = direction;

                    let bundle = createBundleObject();
                    bundle.newMessage(KBEMessages.Baseapp_onUpdateDataFromClientForControlledEntity);
                    bundle.writeInt32(entity.id);
                    bundle.writeFloat(position.x);
                    bundle.writeFloat(position.y);
                    bundle.writeFloat(position.z);

                    bundle.writeFloat(direction.x);
                    bundle.writeFloat(direction.y);
                    bundle.writeFloat(direction.z);
                    bundle.writeUint8(entity.isOnGround);
                    bundle.writeUint32(KBEngineapp.spaceID);
                    bundle.send(KBEngineapp);
                }
            }
        }

        addSpaceGeometryMapping(spaceID: number, respath: string) {
            INFO_MSG("KBEngineApp::addSpaceGeometryMapping: spaceID(" + spaceID + "), respath(" + respath + ")!");

            KBEngineapp.spaceID = spaceID;
            KBEngineapp.spaceResPath = respath;
            KBEngineapp.netEvent.emit(EventTypes.addSpaceGeometryMapping, respath);
        }

        clearSpace(isAll: boolean) {
            KBEngineapp.entityIDAliasIDList.length = 0;
            KBEngineapp.spacedata = Object.create(null);;
            KBEngineapp.clearEntities(isAll);
            KBEngineapp.isLoadedGeometry = false;
            KBEngineapp.spaceID = 0;
        }

        clearEntities(isAll: boolean) {
            KBEngineapp.controlledEntities.length = 0;

            if (!isAll) {
                let entity = KBEngineapp.player();

                for (let eid in KBEngineapp.entities) {
                    if (parseInt(eid) == entity.id)
                        continue;

                    if (KBEngineapp.entities[eid].inWorld) {
                        KBEngineapp.entities[eid].leaveWorld();
                    }

                    KBEngineapp.entities[eid].onDestroy();
                }

                KBEngineapp.entities = Object.create(null);
                KBEngineapp.entities[entity.id] = entity;
            }
            else {
                for (let eid in KBEngineapp.entities) {
                    if (KBEngineapp.entities[eid].inWorld) {
                        KBEngineapp.entities[eid].leaveWorld();
                    }

                    KBEngineapp.entities[eid].onDestroy();
                }

                KBEngineapp.entities = Object.create(null);
            }
        }

        Client_initSpaceData(stream: MemoryStream) {
            KBEngineapp.clearSpace(false);

            KBEngineapp.spaceID = stream.readInt32();
            while (stream.length() > 0) {
                let key = stream.readString();
                let value = stream.readString();
                KBEngineapp.Client_setSpaceData(KBEngineapp.spaceID, key, value);
            }

            INFO_MSG("KBEngineApp::Client_initSpaceData: spaceID(" + KBEngineapp.spaceID + "), datas(" + JSON.stringify(KBEngineapp.spacedata) + ")!");
        }

        Client_setSpaceData(spaceID: number, key: string, value: any) {
            INFO_MSG("KBEngineApp::Client_setSpaceData: spaceID(" + spaceID + "), key(" + key + "), value(" + value + ")!");

            KBEngineapp.spacedata[key] = value;

            if (key == "_mapping")
                KBEngineapp.addSpaceGeometryMapping(spaceID, value);

            KBEngineapp.netEvent.emit(EventTypes.onSetSpaceData, spaceID, key, value);
        }

        Client_delSpaceData(spaceID: number, key: string) {
            INFO_MSG("KBEngineApp::Client_delSpaceData: spaceID(" + spaceID + "), key(" + key + ")!");

            delete KBEngineapp.spacedata[key];
            KBEngineapp.netEvent.emit(EventTypes.onDelSpaceData, spaceID, key);
        }

        Client_getSpaceData(spaceID: number, key: string) {
            return KBEngineapp.spacedata[key];
        }

        Client_onUpdateBasePos(x: number, y: number, z: number) {
            KBEngineapp.entityServerPos.x = x;
            KBEngineapp.entityServerPos.y = y;
            KBEngineapp.entityServerPos.z = z;

            let entity = KBEngineapp.player();
            if (entity && entity.isControlled) {
                entity.position.x = KBEngineapp.entityServerPos.x;
                entity.position.y = KBEngineapp.entityServerPos.y;
                entity.position.z = KBEngineapp.entityServerPos.z;

                KBEngineapp.netEvent.emit(EventTypes.updatePosition, entity);
                entity.onUpdateVolatileData();
            }
        }

        Client_onUpdateBaseDir(stream: MemoryStream) {
            INFO_MSG('Client_onUpdateBaseDir');
        }

        Client_onUpdateBasePosXZ(x: number, z: number) {
            KBEngineapp.entityServerPos.x = x;
            KBEngineapp.entityServerPos.z = z;

            let entity = KBEngineapp.player();
            if (entity && entity.isControlled) {
                entity.position.x = KBEngineapp.entityServerPos.x;
                entity.position.y = KBEngineapp.entityServerPos.y;
                entity.position.z = KBEngineapp.entityServerPos.z;

                KBEngineapp.netEvent.emit(EventTypes.updatePosition, entity);
                entity.onUpdateVolatileData();
            }
        }

        Client_onUpdateData(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onUpdateData: entity(" + eid + ") not found!");
                return;
            }
        }

        Client_onSetEntityPosAndDir(stream: MemoryStream) {
            let eid = stream.readInt32();
            let entity = KBEngineapp.entities[eid];
            if (!entity) {
                ERROR_MSG("KBEngineApp::Client_onSetEntityPosAndDir: entity(" + eid + ") not found!");
                return;
            }

            entity.position.x = stream.readFloat();
            entity.position.y = stream.readFloat();
            entity.position.z = stream.readFloat();
            entity.direction.x = stream.readFloat();
            entity.direction.y = stream.readFloat();
            entity.direction.z = stream.readFloat();

            // 记录玩家最后一次上报位置时自身当前的位置
            entity.entityLastLocalPos.x = entity.position.x;
            entity.entityLastLocalPos.y = entity.position.y;
            entity.entityLastLocalPos.z = entity.position.z;
            entity.entityLastLocalDir.x = entity.direction.x;
            entity.entityLastLocalDir.y = entity.direction.y;
            entity.entityLastLocalDir.z = entity.direction.z;

            entity.set_direction(entity.direction);
            entity.set_position(entity.position);
        }

        Client_onUpdateData_ypr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readFloat();
            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, p, r, -1, false);
        }

        Client_onUpdateData_yp(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readFloat();
            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, p, KBE_FLT_MAX, -1, false);
        }

        Client_onUpdateData_yr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, KBE_FLT_MAX, r, -1, false);
        }

        Client_onUpdateData_pr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, p, r, -1, false);
        }

        Client_onUpdateData_y(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, KBE_FLT_MAX, KBE_FLT_MAX, -1, false);
        }

        Client_onUpdateData_p(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, p, KBE_FLT_MAX, -1, false);
        }

        Client_onUpdateData_r(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, r, -1, false);
        }

        Client_onUpdateData_xz(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, 1, false);
        }

        Client_onUpdateData_xz_ypr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let y = stream.readFloat();
            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, y, p, r, 1, false);
        }

        Client_onUpdateData_xz_yp(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let y = stream.readFloat();
            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, y, p, KBE_FLT_MAX, 1, false);
        }

        Client_onUpdateData_xz_yr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let y = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, y, KBE_FLT_MAX, r, 1, false);
        }

        Client_onUpdateData_xz_pr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, KBE_FLT_MAX, p, r, 1, false);
        }

        Client_onUpdateData_xz_y(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let y = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, y, KBE_FLT_MAX, KBE_FLT_MAX, 1, false);
        }

        Client_onUpdateData_xz_p(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, KBE_FLT_MAX, p, KBE_FLT_MAX, 1, false);
        }

        Client_onUpdateData_xz_r(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let z = stream.readFloat();

            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, KBE_FLT_MAX, z, KBE_FLT_MAX, KBE_FLT_MAX, r, 1, false);
        }

        Client_onUpdateData_xyz(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, 0, false);
        }

        Client_onUpdateData_xyz_ypr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let yaw = stream.readFloat();
            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, yaw, p, r, 0, false);
        }

        Client_onUpdateData_xyz_yp(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let yaw = stream.readFloat();
            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, yaw, p, KBE_FLT_MAX, 0, false);
        }

        Client_onUpdateData_xyz_yr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let yaw = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, yaw, KBE_FLT_MAX, r, 0, false);
        }

        Client_onUpdateData_xyz_pr(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let p = stream.readFloat();
            let r = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, KBE_FLT_MAX, p, r, 0, false);
        }

        Client_onUpdateData_xyz_y(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let yaw = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, yaw, KBE_FLT_MAX, KBE_FLT_MAX, 0, false);
        }

        Client_onUpdateData_xyz_p(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, KBE_FLT_MAX, p, KBE_FLT_MAX, 0, false);
        }

        Client_onUpdateData_xyz_r(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let x = stream.readFloat();
            let y = stream.readFloat();
            let z = stream.readFloat();

            let p = stream.readFloat();

            KBEngineapp._updateVolatileData(eid, x, y, z, p, KBE_FLT_MAX, KBE_FLT_MAX, 0, false);
        }

        //--------------------optiom------------------------//
        Client_onUpdateData_ypr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readInt8();
            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, p, r, -1, true);
        }

        Client_onUpdateData_yp_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readInt8();
            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, p, KBE_FLT_MAX, -1, true);
        }

        Client_onUpdateData_yr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, KBE_FLT_MAX, r, -1, true);
        }

        Client_onUpdateData_pr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, p, r, -1, true);
        }

        Client_onUpdateData_y_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let y = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, y, KBE_FLT_MAX, KBE_FLT_MAX, -1, true);
        }

        Client_onUpdateData_p_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, p, KBE_FLT_MAX, -1, true);
        }

        Client_onUpdateData_r_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, r, -1, true);
        }

        Client_onUpdateData_xz_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, 1, true);
        }

        Client_onUpdateData_xz_ypr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let y = stream.readInt8();
            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], y, p, r, 1, true);
        }

        Client_onUpdateData_xz_yp_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let y = stream.readInt8();
            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], y, p, KBE_FLT_MAX, 1, true);
        }

        Client_onUpdateData_xz_yr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let y = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], y, KBE_FLT_MAX, r, 1, true);
        }

        Client_onUpdateData_xz_pr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], KBE_FLT_MAX, p, r, 1, true);
        }

        Client_onUpdateData_xz_y_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let y = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], y, KBE_FLT_MAX, KBE_FLT_MAX, 1, true);
        }

        Client_onUpdateData_xz_p_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], KBE_FLT_MAX, p, KBE_FLT_MAX, 1, true);
        }

        Client_onUpdateData_xz_r_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();

            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], KBE_FLT_MAX, xz[1], KBE_FLT_MAX, KBE_FLT_MAX, r, 1, true);
        }

        Client_onUpdateData_xyz_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], KBE_FLT_MAX, KBE_FLT_MAX, KBE_FLT_MAX, 0, true);
        }

        Client_onUpdateData_xyz_ypr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let yaw = stream.readInt8();
            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], yaw, p, r, 0, true);
        }

        Client_onUpdateData_xyz_yp_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let yaw = stream.readInt8();
            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], yaw, p, KBE_FLT_MAX, 0, true);
        }

        Client_onUpdateData_xyz_yr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let yaw = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], yaw, KBE_FLT_MAX, r, 0, true);
        }

        Client_onUpdateData_xyz_pr_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let p = stream.readInt8();
            let r = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], KBE_FLT_MAX, p, r, 0, true);
        }

        Client_onUpdateData_xyz_y_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let yaw = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], yaw, KBE_FLT_MAX, KBE_FLT_MAX, 0, true);
        }

        Client_onUpdateData_xyz_p_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], KBE_FLT_MAX, p, KBE_FLT_MAX, 0, true);
        }

        Client_onUpdateData_xyz_r_optimized(stream: MemoryStream) {
            let eid = KBEngineapp.getViewEntityIDFromStream(stream);

            let xz = stream.readPackXZ();
            let y = stream.readPackY();

            let p = stream.readInt8();

            KBEngineapp._updateVolatileData(eid, xz[0], y, xz[1], p, KBE_FLT_MAX, KBE_FLT_MAX, 0, true);
        }

        _updateVolatileData(entityID: number, x: number, y: number, z: number, yaw: number, pitch: number, roll: number, isOnGround: number, isOptimized: boolean) {
            let entity = KBEngineapp.entities[entityID];
            if (!entity) {
                // 如果为0且客户端上一步是重登陆或者重连操作并且服务端entity在断线期间一直处于在线状态
                // 则可以忽略这个错误, 因为cellapp可能一直在向baseapp发送同步消息， 当客户端重连上时未等
                // 服务端初始化步骤开始则收到同步信息, 此时这里就会出错。
                ERROR_MSG("KBEngineApp::_updateVolatileData: entity(" + entityID + ") not found!");
                return;
            }

            // 小于0不设置
            if (isOnGround >= 0) {
                entity.isOnGround = (isOnGround > 0);
            }

            let changeDirection = false;

            if (roll !== KBE_FLT_MAX) {
                changeDirection = true;
                entity.direction.x = isOptimized ? int82angle(roll, false) : roll;
            }

            if (pitch !== KBE_FLT_MAX) {
                changeDirection = true;
                entity.direction.y = isOptimized ? int82angle(pitch, false) : pitch;
            }

            if (yaw !== KBE_FLT_MAX) {
                changeDirection = true;
                entity.direction.z = isOptimized ? int82angle(yaw, false) : yaw;
            }

            let done = false;
            if (changeDirection) {
                KBEngineapp.netEvent.emit(EventTypes.set_direction, entity);
                done = true;
            }

            let positionChanged = false;
            if (x !== KBE_FLT_MAX || y !== KBE_FLT_MAX || z !== KBE_FLT_MAX)
                positionChanged = true;

            if (x === KBE_FLT_MAX) x = isOptimized ? 0.0 : entity.position.x;
            if (y === KBE_FLT_MAX) y = isOptimized ? 0.0 : entity.position.y;
            if (z === KBE_FLT_MAX) z = isOptimized ? 0.0 : entity.position.z;

            if (positionChanged) {
                if (isOptimized) {
                    entity.position.x = x + KBEngineapp.entityServerPos.x;
                    entity.position.y = y + KBEngineapp.entityServerPos.y;
                    entity.position.z = z + KBEngineapp.entityServerPos.z;
                }
                else {
                    entity.position.x = x;
                    entity.position.y = y;
                    entity.position.z = z;
                }

                done = true;
                KBEngineapp.netEvent.emit(EventTypes.updatePosition, entity);
            }

            if (done)
                entity.onUpdateVolatileData();
        }

        Client_onStreamDataStarted(id: number, datasize: number, descr: string) {
            KBEngineapp.netEvent.emit(EventTypes.onStreamDataStarted, id, datasize, descr);
        }

        Client_onStreamDataRecv(stream: MemoryStream) {
            let id = stream.readUint16();
            let data = stream.readBlob();
            KBEngineapp.netEvent.emit(EventTypes.onStreamDataRecv, id, data);
        }

        Client_onStreamDataCompleted(id: number) {
            KBEngineapp.netEvent.emit(EventTypes.onStreamDataCompleted, id);
        }

        Client_onReqAccountResetPasswordCB(failedcode: number) {
            KBEngineapp.netEvent.emit(EventTypes.onResetPassword, failedcode);
            if (failedcode != 0) {
                ERROR_MSG("KBEngineApp::Client_onReqAccountResetPasswordCB: " + KBEngineapp.username + " is failed! code=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
                return;
            }

            INFO_MSG("KBEngineApp::Client_onReqAccountResetPasswordCB: " + KBEngineapp.username + " is successfully!");
        }

        Client_onReqAccountBindEmailCB(failedcode: number) {
            KBEngineapp.netEvent.emit(EventTypes.onBindAccountEmail, failedcode);
            if (failedcode != 0) {
                ERROR_MSG("KBEngineApp::Client_onReqAccountBindEmailCB: " + KBEngineapp.username + " is failed! code=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
                return;
            }

            INFO_MSG("KBEngineApp::Client_onReqAccountBindEmailCB: " + KBEngineapp.username + " is successfully!");
        }

        Client_onReqAccountNewPasswordCB(failedcode: number) {
            KBEngineapp.netEvent.emit(EventTypes.onNewPassword, failedcode);
            if (failedcode != 0) {
                ERROR_MSG("KBEngineApp::Client_onReqAccountNewPasswordCB: " + KBEngineapp.username + " is failed! code=" + failedcode + "(" + KBEngineapp.serverErrs[failedcode].name + ")!");
                return;
            }

            INFO_MSG("KBEngineApp::Client_onReqAccountNewPasswordCB: " + KBEngineapp.username + " is successfully!");
        }

        static create(kbengineArgs: KBEngineArgs, autoDestroy: boolean = false) {
            if (KBEngineapp) {
                if(autoDestroy) {
                    KBEngineapp.destroy();
                }
                else {
                    console.log('KBEngine::create already created KBEngineapp');
                    return KBEngineapp;
                }
            }

            // 一些平台如小程序上可能没有assert
            if (!console.assert) {
                console.assert = function (bRet, s) {
                    if (!(bRet)) {
                        ERROR_MSG(s);
                    }
                }
            }

            if (kbengineArgs.constructor != KBEngineArgs) {
                ERROR_MSG("KBEngine.create(): args(" + kbengineArgs + ") error! not is KBEngine.KBEngineArgs");
                return;
            }

            new KBEngineApp(kbengineArgs);

            KBEngineapp.reset();
            KBEngineapp.installEvents();
            KBEngineapp.idInterval = setInterval(KBEngineapp.update, 1000 / kbengineArgs.updateHZ);
            return KBEngineapp;
        }

        destroy() {
            if (KBEngineapp.idInterval)
                clearInterval(KBEngineapp.idInterval);

            if (!KBEngineapp)
                return;

            KBEngineapp.uninstallEvents();
            KBEngineapp.reset();
            KBEngineapp = null;
        }
    }
    //#endregion
}

//#region Event
class  CallbackList {
    callbacks: Function[] = [];
    targets: any[] = [];
}

export class CustomEventTarget {

    private callbackTable: {[key: string] : CallbackList} = Object.create(null);

    on(type: number | string, callback: Function, target: any = null) {
        if(!callback) {
            console.error('callback is null');
            return;
        }

        if(this.hasEventListener(type, callback, target)) {
            return;
        }
        
        let list = this.callbackTable[type];
        if(!list) {
            list = this.callbackTable[type] = new CallbackList();
        }
        list.callbacks.push(callback);
        list.targets.push(target);
    }

    off(type: number | string, callback: Function, target: any = null) {
        if(callback) {
            let list = this.callbackTable[type];
            if(list) {
                let callbacks = list.callbacks;
                let targets = list.targets;
                for(let i = 0; i < callbacks.length; i++) {
                    if(callbacks[i] === callback && targets[i] === target) {
                        callbacks.splice(i, 1);
                        targets.splice(i, 1);
                        break;
                    }
                }
            }
        
        }
        else {
            console.error('callback is null');
        }
    }

    emit(type: number | string, ...args: any) {
        let list = this.callbackTable[type];
        if(list) {
            let callbacks = list.callbacks;
            let targets = list.targets;
            for(let i = callbacks.length - 1; i >= 0; i--) {
                if(callbacks[i]) {
                    callbacks[i].apply(targets[i] || null, args);
                }
            }
        }
    }

    targetOff(target: any) {
        for(let k in this.callbackTable) {
            let list = this.callbackTable[k];
            let targets = list.targets;
            let callbacks = list.callbacks;
            for(let i = targets.length; i >= 0; i--) {
                if(targets[i] === target) {
                    callbacks.splice(i, 1);
                    targets.splice(i, 1);
                }
            }
        }
    }

    hasEventListener(type: number | string, callback: Function, target?: any) {
        let list = this.callbackTable[type];
        if(!list) {
            return false;
        }

        let callbacks = list.callbacks;
        let targets = list.targets;
        target = target || null;
        for(let i = 0; i < callbacks.length; i++) {
            if(callbacks[i] === callback && targets[i] === target) {
                return true;
            }
        }
        return false;
    }

    clear() {
        this.callbackTable = Object.create(null);
    }
}
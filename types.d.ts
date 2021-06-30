type UINT64 = {
    lo: number;
    hi: number;
    long: Long;
    toString(): string;
    isZero(): boolean;
    addSelf(other: number | Long): UINT64;

    add(other: number | Long): Long;

    subSelf(other: number | Long): UINT64;

    sub(other: number | Long): Long;

    /**
     * 0 if they are the same; 
     * 
     * 1 if the this is greater;
     * 
     * -1 if the given one is greater;
     */
    comp(other: number | Long): number; 
    
    mulSelf(other: number | Long): UINT64;

    mul(other: number | Long): Long;

    divSelf(other: number | Long): UINT64;

    div(other: number | Long | string): Long;

    isSame(other: UINT64): boolean;

    zero(): void;
}

type AvatarInfo = {
    /**
     * 0-正常
     * 1-逻辑删除
     */
    isDel: number;
    dbid: UINT64;
    name: string;
    roleType: number;
};
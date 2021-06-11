 /* O P T I O N   T Y P E   V A L U E S */
// 0 = None, 1 = Fatal, 2 = Errors, 3 = Warnings, 4 = Info, 5 = Debug, 6 = Verbose
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/* O B S E R V E R  C H A N G E  E V E N T S */
export interface ChangeEvent<T> {
    from : T;
    to   : T;
}

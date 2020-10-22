import React from 'react';
interface registerType {
    state: object;
    sync?: object;
    async?: object;
}
declare const Context: React.Context<any>;
declare const useComponent: (Component: new (props: any) => any) => any;
declare class Mihux {
    private state;
    private returnMap;
    private store;
    private mutation;
    private mapState;
    private getNewState;
    private set;
    private setIn;
    private merge;
    private getValue;
    private mapMutation;
    private init;
    register: (registerProps: registerType) => void;
    Provider: React.FC<any>;
}
export { Mihux, Context, useComponent };

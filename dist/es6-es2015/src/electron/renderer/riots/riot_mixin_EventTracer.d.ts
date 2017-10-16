export interface RiotMixinWithOpts extends RiotMixin {
    getOpts(): any;
    setOpts(opts: any, update: boolean): RiotTag;
}
export declare const riot_mixin_EventTracer: RiotMixinWithOpts;

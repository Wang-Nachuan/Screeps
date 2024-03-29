import {Agent} from "../agent";
import {Tasks} from "../../task/tasks";

export class AgentPraetor extends Agent {
    readonly type = 'praetor';
    controller: any;
    protected _spawns: Array<any>;

    readonly STATE_RCL0 = 0;
    readonly STATE_RCL1 = 1;
    readonly STATE_RCL2 = 2;
    readonly STATE_RCL3 = 3;
    readonly STATE_RCL4 = 4;
    readonly STATE_RCL5 = 5;
    readonly STATE_RCL6 = 6;
    readonly STATE_RCL7 = 7;
    readonly STATE_RCL8 = 8;

    constructor(isInit: boolean, ref: MemRef, roomName?: string) {
        super(isInit, ref, roomName);
        this._spawns = null;
        if (isInit) {
            this.controller = this.room.controller;
            this.data.ctrId = this.room.controller.id;
            this.data.spawnLog = {};
            this.state = this.STATE_RCL0;
            this.wb();
        } else {
            this.controller = Game.getObjectById(this.data.ctrId);
        }
    }

    get spawns(): any {
        if (!this._spawns) {
            this._spawns = getObjectInCache(false, this._ref.slice(0, -2)).struct.spawn;
        }
        return this._spawns;
    }

    printMsg(msg: string) {
        console.log('[MESSAGE] Praetor (room ' + this.room.name + '): ' + msg);
    }

    spawnCreep(role: string, body: {[name: string]: number}) {
        let idx = -1;
        let minTime = Infinity;
        for (let i=0; i<this.spawns.length; i++) {
            if (this.spawns[i].data.rTime < minTime) {
                idx = i;
                minTime = this.spawns[i].data.rTime;
            }
        }
        if (idx != -1) {
            this.spawns[idx].addSpawnReq(role, body);
        }
    }

    exe() {
        // console.log('state: ', this.state);
        switch (this.state) {
            case this.STATE_RCL0: {
                if (this.controller.level == 1) {
                    this.state = this.STATE_RCL1;
                    this.printMsg('RCL reaches level 1');
                }
                break;
            }
            case this.STATE_RCL1: {
                if (!this.data.spawnLog['w1']) {
                    this.data.spawnLog['w1'] = true;
                    this.spawnCreep('worker', {'work': 1, 'move': 2, 'carry': 2});
                }
                if (this.controller.level == 2) {
                    this.state = this.STATE_RCL2;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 2');
                }
                break;
            }
            case this.STATE_RCL2: {
                if (this.controller.level == 3) {
                    this.state = this.STATE_RCL3;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 3');
                }
                break;
            }
            case this.STATE_RCL3: {
                if (this.controller.level == 4) {
                    this.state = this.STATE_RCL4;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 4');
                }
                break;
            }
            case this.STATE_RCL4: {
                if (this.controller.level == 5) {
                    this.state = this.STATE_RCL5;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 5');
                }
                break;
            }
            case this.STATE_RCL5: {
                if (this.controller.level == 6) {
                    this.state = this.STATE_RCL6;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 6');
                }
                break;
            }
            case this.STATE_RCL6: {
                if (this.controller.level == 7) {
                    this.state = this.STATE_RCL7;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 7');
                }
                break;
            }
            case this.STATE_RCL7: {
                if (this.controller.level == 8) {
                    this.state = this.STATE_RCL8;
                    this.data.spawnLog = {};
                    this.printMsg('RCL reaches level 8');
                }
                break;
            }
            case this.STATE_RCL8: {
                break;
            }
            default: {}
        }
    }
}
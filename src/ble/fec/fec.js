import { xf, equals, exists, empty, first, filterIn } from '../../functions.js';
import { uuids } from '../uuids.js';
import { message } from '../../ant/message.js';
import { page } from '../../ant/page.js';

function fec2Decoder(dataview) {
    const data = message.data(dataview);
    if(data.page === 25) {
        // self.onPower(data.power);
        // self.onCadence(data.cadence);
    }
    if(data.page === 16) {
        // self.onSpeed(data.speed);
    }
    return data;
}

function powerTarget(value, channel = 5) {
    return message.control(page.dataPage49(value, channel));
}
function resistanceTarget(value, channel = 5) {
    return message.control(page.dataPage48(value, channel));
}
function slopeTarget(value, channel = 5) {
    return message.control(page.dataPage51(value, channel));
}

function eventToValue(decoder, callback) {
    return function (e) {
        return callback(decoder(e.target.value));
    };
}

class FEC {
    uuid = uuids.fec;
    characteristics = {};
    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onStatus = args.onStatus || ((x) => x);
        this.onControl = args.onControl || ((x) => x);
        this.onData = args.onData || ((x) => x);
    }
    async init() {
        const self = this;
        self.service = await self.ble.getService(self.server, self.uuid);
        self.characteristics = await self.getCharacteristics(self.service);

        await self.ble.sub(self.characteristics.fec2,
                           eventToValue(fec2Decoder, self.onData));
    }
    async getCharacteristics(service) {
        const self = this;
        const fec2 = await self.ble.getCharacteristic(service, uuids.fec2);
        const fec3 = await self.ble.getCharacteristic(service, uuids.fec3);

        return { fec2, fec3 };
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = powerTarget(value);
        const characteristic = self.characteristics.fec3;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = resistanceTarget(value);
        const characteristic = self.characteristics.fec3;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = slopeTarget(value);
        const characteristic = self.characteristics.fec3;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
}

export { FEC };

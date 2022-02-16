import { xf, equals, rand } from './functions.js';

class TrainerMock {
    constructor() {
        this.powerTarget = 180;
        this.cadence = 80;
        this.power = 180;
        this.speed = 20;
        this.heartRate = 140;
        // this.init();
    }
    init() {
        const self = this;

        xf.sub('db:powerTarget', self.onPowerTarget.bind(self));
        xf.sub('ui:workoutStart', self.run.bind(self));
        xf.sub('ui:watchStart', self.run.bind(self));
        xf.sub('ui:watchResume', self.run.bind(self));
        xf.sub('ui:watchPause', self.stop.bind(self));

        self.id = 'ble:controllable';
        self.name = 'Tacx Flux 46731';

        xf.dispatch(`${self.id}:connected`);
        xf.dispatch(`${self.id}:name`, self.name);

        self.hrId = 'ble:hrm';
        self.hrName = 'Tacx HRB 20483';

        xf.dispatch(`${self.hrId}:connected`);
        xf.dispatch(`${self.hrId}:name`, self.hrName);

        console.warn('|------------------------|');
        console.warn('|Trainer Mock Data is ON!|');
        console.warn('|------------------------|');
    }
    run() {
        const self = this;
        self.interval = self.broadcast(self.indoorBikeData.bind(self));
    }
    stop() {
        const self = this;
        clearInterval(self.interval);
    }
    broadcast(handler) {
        const interval = setInterval(handler, 1000);
        return interval;
    }
    indoorBikeData() {
        const self = this;
        self.power = this.powerNext(self.power);
        self.heartRate = this.heartRateNext(self.heartRate);
        self.cadence = this.cedenceNext(self.cadence);
        self.speed = this.powerToSpeed(self.power);

        xf.dispatch('power', self.power);
        xf.dispatch('heartRate', self.heartRate);
        xf.dispatch('cadence', self.cadence);
        xf.dispatch('speed', self.speed);
    }
    onPowerTarget(powerTarget) {
        this.powerTarget = powerTarget;
        this.power = powerTarget;
        this.heartRate = this.powerToHeartRate(powerTarget);
    }
    onSlopeTarget(slope) {
        this.slopeTarget = slope;
    }
    powerNext(prev) {
        let low = rand(1,100);
        if(low === 90) {
            return 0;
        }
        return prev + rand(-8, 8);
    }
    cadenceNext(prev) {
        return prev + rand(0, 2);
    }
    heartRateNext(prev) {
        return prev + rand(0, 1);
    }
    powerToSpeed(power) {
        // use a model
        return 20;
    }
    powerToHeartRate(power) {
        const base = 90;
        if(equals(this.powerToZone(power).name, 'one')) {
            base = 100;
        }
        if(equals(this.powerToZone(power).name, 'two')) {
            base = 130;
        }
        if(equals(this.powerToZone(power).name, 'three')) {
            base = 150;
        }
        if(equals(this.powerToZone(power).name, 'four')) {
            base = 160;
        }
        if(equals(this.powerToZone(power).name, 'five')) {
            base = 170;
        }
        if(equals(this.powerToZone(power).name, 'six')) {
            base = 180;
        }
        if(equals(this.powerToZone(power).name, 'seven')) {
            base = 190;
        }
        return base;
    }
    powerToZone(value, ftp, zones) {
        const self = this;

        let index = 0;
        let name = zones[index];
        if(value < (ftp * self.percentages.one)) {
            index = 0;
            name = zones[index];
        } else if(value < (ftp * self.percentages.two)) {
            index = 1;
            name = zones[index];
        } else if(value < (ftp * self.percentages.three)) {
            index = 2;
            name = zones[index];
        } else if(value < (ftp * self.percentages.four)) {
            index = 3;
            name = zones[index];
        } else if(value < (ftp * self.percentages.five)) {
            index = 4;
            name = zones[index];
        } else if (value < (ftp * self.percentages.six)) {
            index = 5;
            name = zones[index];
        } else {
            index = 6;
            name = zones[index];
        }
        return {name, index};
    }
}

function cadenceTargetMock() {

    setInterval(function() {
        xf.dispatch('cadence', 100 + rand(-4, 4));
    }, 1000);

    setInterval(function() {
        const t = rand(0, 1);
        if(equals(t, 0)) {
            xf.dispatch('ui:cadence-target-set', 100);
        } else {
            xf.dispatch('ui:cadence-target-set', 0);
        }
    }, 4000);
}

const trainerMock = new TrainerMock();

export { trainerMock };

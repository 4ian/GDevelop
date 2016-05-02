gdjs.Profiler = function() {
    this._currentSection = null;
    this._frameIndex = 0;
    this.datas = [];

    while(this.datas.length < 30) {
        this.datas.push({});
    }

    this._averages = {};
    this._counts = {};
}

gdjs.Profiler.prototype.frameStarted = function() {
    this._currentSection = null;

    this._frameIndex++;
    if (this._frameIndex >= 30) this._frameIndex = 0;
    this._frameStart = Date.now();
}

gdjs.Profiler.prototype.begin = function(sectionName) {
    if (this._currentSection) this.end();

    this._currentSection = sectionName;
    this._currentStart = Date.now();
}

gdjs.Profiler.prototype.end = function() {
    this.datas[this._frameIndex][this._currentSection] = Date.now() - this._currentStart;
    this.datas[this._frameIndex]['total'] = Date.now() - this._frameStart;
}

gdjs.Profiler.prototype.getAverage = function() {
    for(var p in this._averages) {
        if (this._averages.hasOwnProperty(p)) this._averages[p] = 0;
        if (this._counts.hasOwnProperty(p)) this._counts[p] = 0;
    }

    for(var i = 0;i < this.datas.length;++i) {
        for(var p in this.datas[i]) {
            this._averages[p] = (this._averages[p] || 0) + this.datas[i][p];
            this._counts[p] = (this._counts[p] || 0) + 1;
        }
    }

    for(var p in this._averages) {
        if (this._averages.hasOwnProperty(p)) this._averages[p] /= this._counts[p];
    }


    return this._averages;
}

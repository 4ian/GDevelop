gdjs.Profiler = function() {
    this._currentSection = null;
    this.datas = [];
}

gdjs.Profiler.prototype.frameStarted = function() {
    this._currentSection = null;

    this.datas.unshift({});
    if (this.datas.length > 30) this.datas.length = 30;
    this._frameStart =  Date.now();
}

gdjs.Profiler.prototype.begin = function(sectionName) {
    if (this._currentSection) this.end();

    this._currentSection = sectionName;
    this._currentStart =  Date.now();
}

gdjs.Profiler.prototype.end = function() {
    this.datas[0][this._currentSection] =  Date.now() - this._currentStart;
    this.datas[0]['total'] =  Date.now() - this._frameStart;
}

gdjs.Profiler.prototype.getAverage = function() {
    var averages = {};
    var counts = {};
    for(var i = 0;i < this.datas.length;++i) {
        for(var p in this.datas[i]) {
            averages[p] = (averages[p] || 0) + this.datas[i][p];
            counts[p] = (counts[p] || 0) + 1;
        }
    }

    for(var p in averages) {
        if (averages.hasOwnProperty(p)) averages[p] /= counts[p];
    }


    return averages;
}

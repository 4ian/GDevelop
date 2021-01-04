describe('gdjs.VariablesContainer', function() {
  it('benchmark get', function() {
    this.timeout(20000);
    var container = new gdjs.VariablesContainer();

    const benchmarkSuite = makeBenchmarkSuite();
    benchmarkSuite
      .add('get', () => {
        container.get('Var1');
        container.get('Var2');
        container.get('Var3');
      });

    console.log(benchmarkSuite.run());
  });
});

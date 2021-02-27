describe('Inventory', function () {
  var inventory = new gdjs.Inventory();

  it('is empty when constructed', function () {
    expect(inventory.has('sword')).to.be(false);
    expect(inventory.has('soul reaver')).to.be(false);
  });

  it('can receive one or more items', function () {
    expect(inventory.add('sword')).to.be(true);
    expect(inventory.has('sword')).to.be(true);
    expect(inventory.has('soul reaver')).to.be(false);

    expect(inventory.add('soul reaver')).to.be(true);
    expect(inventory.add('sword')).to.be(true);
    expect(inventory.has('sword')).to.be(true);
    expect(inventory.has('soul reaver')).to.be(true);
  });

  it('can return the number of items', function () {
    expect(inventory.count('sword')).to.be(2);
    expect(inventory.count('soul reaver')).to.be(1);
  });

  it('can equip items', function () {
    expect(inventory.equip('soul reaver', true)).to.be(true);
    expect(inventory.isEquipped('soul reaver')).to.be(true);

    expect(inventory.equip('sword', true)).to.be(true);
    expect(inventory.isEquipped('sword')).to.be(true);
    expect(inventory.equip('sword', false)).to.be(true);
    expect(inventory.isEquipped('sword')).to.be(false);
    expect(inventory.equip('sword', true)).to.be(true);

    expect(inventory.equip('nothing', true)).to.be(false);
    expect(inventory.isEquipped('nothing')).to.be(false);
  });

  it('support removing an item', function () {
    expect(inventory.remove('sword')).to.be(true);
    expect(inventory.count('sword')).to.be(1);
    expect(inventory.isEquipped('sword')).to.be(true);

    expect(inventory.remove('sword')).to.be(true);
    expect(inventory.count('sword')).to.be(0);
    expect(inventory.isEquipped('sword')).to.be(false);

    expect(inventory.remove('sword')).to.be(false);
    expect(inventory.count('sword')).to.be(0);

    expect(inventory.count('soul reaver')).to.be(1);
    expect(inventory.isEquipped('soul reaver')).to.be(true);
  });

  it('can support having a limited number of objects', function () {
    expect(inventory.count('heavy sword')).to.be(0);
    inventory.setMaximum('heavy sword', 2);
    expect(inventory.add('heavy sword')).to.be(true);
    expect(inventory.count('heavy sword')).to.be(1);
    expect(inventory.has('heavy sword')).to.be(true);

    expect(inventory.add('heavy sword')).to.be(true);
    expect(inventory.count('heavy sword')).to.be(2);
    expect(inventory.add('heavy sword')).to.be(false);
    expect(inventory.count('heavy sword')).to.be(2);
    inventory.setUnlimited('heavy sword', true);
    expect(inventory.count('heavy sword')).to.be(2);
    expect(inventory.add('heavy sword')).to.be(true);
    expect(inventory.add('heavy sword')).to.be(true);
    expect(inventory.count('heavy sword')).to.be(4);

    inventory.setMaximum('never sword', 0);
    expect(inventory.add('never sword')).to.be(false);
    expect(inventory.has('never sword')).to.be(false);
    expect(inventory.count('never sword')).to.be(0);
  });
});

// @ts-check

describe('Leaderboards', () => {
  describe('formatPlayerName', () => {
    it('it returns name if correct', () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName('PlayerName')).to.be(
        'PlayerName'
      );
    });

    it('it returns name with underscores instead of whitespaces except for leading and trailing ones that are removed', () => {
      expect(
        gdjs.evtTools.leaderboards.formatPlayerName('\tMy Player Name  ')
      ).to.be('My_Player_Name');
    });

    it("it doesn't change a name with vertical bars and hyphens", () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName('Pla-yer|Name')).to.be(
        'Pla-yer|Name'
      );
    });

    it('it truncates name if longer than 30', () => {
      expect(
        gdjs.evtTools.leaderboards.formatPlayerName(
          'aPlayerNameTh4tIsT00LongToBeSaved'
        )
      ).to.be('aPlayerNameTh4tIsT00LongToBeSa');
    });

    it('it generates a predefined player name with a random number if input is void/wrong type/empty', () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName(null)).to.be('');
      expect(gdjs.evtTools.leaderboards.formatPlayerName(undefined)).to.be('');
      expect(gdjs.evtTools.leaderboards.formatPlayerName('')).to.be('');

      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(5)).to.be('');
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(() => {})).to.be('');
    });

    it('it removes accents from latin letters', () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName('plâyèrÏonisé')).to.be(
        'playerIonise'
      );
    });

    it('it removes non-accepted characters in a long name', () => {
      expect(
        gdjs.evtTools.leaderboards.formatPlayerName(
          'aＰιΥÉᚱｎÀⅯeThatᎥsTooⅬonᏀToBeՏaѵÊĐThisPartAppears'
        )
      ).to.be('aEAeThatsTooonToBeaEThisPartAp');
    });
  });
});

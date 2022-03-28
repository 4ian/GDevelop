// @ts-check

describe('Leaderboards', () => {
  describe('formatPlayerName', () => {
    it('it returns name if correct', () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName('PlayerName')).to.be(
        'PlayerName'
      );
    });

    it('it returns name with underscores instead of whitespaces', () => {
      expect(gdjs.evtTools.leaderboards.formatPlayerName('Player Name')).to.be(
        'Player_Name'
      );
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
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(null)).to.match(
        /^Player\d{5}/
      );
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(5)).to.match(
        /^Player\d{5}/
      );
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(undefined)).to.match(
        /^Player\d{5}/
      );
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName(() => {})).to.match(
        /^Player\d{5}/
      );
      // @ts-ignore
      expect(gdjs.evtTools.leaderboards.formatPlayerName('')).to.match(
        /^Player\d{5}/
      );
    });

    it('it removes non-accepted characters in a long name', () => {
      expect(
        gdjs.evtTools.leaderboards.formatPlayerName(
          'aＰιâΥÉᚱｎÀⅯeThatᎥsTooⅬonᏀToBeՏaѵÊĐThisPartAppears'
        )
      ).to.be('aeThatsTooonToBeaThisPartAppea');
    });
  });
});

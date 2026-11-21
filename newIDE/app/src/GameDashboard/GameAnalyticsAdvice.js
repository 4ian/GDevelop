// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import type { I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type Game } from '../Utils/GDevelopServices/Game';
import Paper from '../UI/Paper';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import LampBulb from '../UI/CustomSvgIcons/LampBulb';
import Text from '../UI/Text';
import FlatButton from '../UI/FlatButton';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import { Column } from '../UI/Grid';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import MarketingPlansDialog from '../MarketingPlans/MarketingPlansDialog';
import {
  type GameAnalytics,
  minPlayersCountForRates,
} from './GameAnalyticsEvaluator';
import { formatPercent } from './GameAnalyticsCharts';

const publishingHelpLink = getHelpLink('/publishing');

const styles = {
  paper: { padding: 16 },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
};

type Tip = {| title: MessageDescriptor, body: MessageDescriptor |};

// The same tips as the weekly email about the game metrics: one is shown each week.
const tips: {|
  lowRetention: Array<Tip>,
  highBounce: Array<Tip>,
  fewPlayers: Array<Tip>,
|} = {
  lowRetention: [
    {
      title: t`Give them something to beat`,
      body: t`If your game has a score or a time, show the player's best at the end of each run. A leaderboard goes one step further: players come back to take their place back.`,
    },
    {
      title: t`Let them keep what they earned`,
      body: t`If your game has levels, items or upgrades, save them. Players return to what they have already built or unlocked, and rarely restart from zero.`,
    },
    {
      title: t`End each session with what comes next`,
      body: t`When the game ends, show what the player was about to reach: the next level, a locked character, how close they were to their best.`,
    },
    {
      title: t`Ship something new`,
      body: t`A new level, enemy or mode gives you a reason to tell people about your game again, and gives past players a reason to reopen it.`,
    },
    {
      title: t`Ask the players who left`,
      body: t`Open your game for feedback on gd.games and read what players say. They will often tell you why they stopped.`,
    },
    {
      title: t`Make every run a little different`,
      body: t`Random level layouts, enemy patterns or a challenge that changes each day make a second visit feel new instead of repeated.`,
    },
    {
      title: t`Add a goal beyond the first win`,
      body: t`Players who finished have no reason to return. A harder mode, collectibles or achievements give your best players something left to do.`,
    },
    {
      title: t`Keep sessions short`,
      body: t`A game that can be enjoyed in two minutes is easier to reopen than one that asks for twenty. Let players stop and resume without losing anything.`,
    },
    {
      title: t`Say when you update`,
      body: t`When you publish a new version, tell the people who follow you and the communities where you shared the game. Most past players never learn that something changed.`,
    },
    {
      title: t`Reward coming back`,
      body: t`If your game has coins, items or lives, give a small bonus on the first run of the day. It costs little to build and gives a concrete reason to return.`,
    },
  ],
  highBounce: [
    {
      title: t`Get into the action in 5 seconds`,
      body: t`A player who is not playing 5 seconds after the game appears is usually lost. Skip the menu, story and settings on the first launch: start the game, explain later.`,
    },
    {
      title: t`Measure your loading time`,
      body: t`Open your game on a phone using mobile data, not your Wi-Fi. If you wait more than a few seconds, large images and sounds are the usual cause.`,
    },
    {
      title: t`Show the controls`,
      body: t`Display how to play on screen during the first seconds, and check that the game is playable with touch: many players are on a phone.`,
    },
    {
      title: t`Make the first seconds impossible to lose`,
      body: t`A player who dies or gets stuck right away rarely tries again. Keep the very beginning easy, and raise the difficulty after.`,
    },
    {
      title: t`Watch someone play`,
      body: t`Give your game to someone who has never seen it and say nothing. Where they hesitate in the first minute is where other players leave.`,
    },
    {
      title: t`Make the first screen obvious`,
      body: t`A new player should see at a glance who they are and what to do. If it needs more than one short sentence, simplify the first scene.`,
    },
    {
      title: t`Check small screens`,
      body: t`Open your game on a phone, in both orientations. Text must be readable and buttons reachable with thumbs.`,
    },
    {
      title: t`Give a win in the first 30 seconds`,
      body: t`A first coin collected, a first enemy beaten, a first level cleared: an early reward tells players the game is worth their time.`,
    },
    {
      title: t`Make every action respond`,
      body: t`A sound and a visual reaction when the player jumps, hits or collects make a game feel alive from the first input.`,
    },
    {
      title: t`Promise what the game delivers`,
      body: t`Players who expected something else leave at once. Check that your thumbnail, title and description show the game as it is played.`,
    },
  ],
  fewPlayers: [
    {
      title: t`Start with people you know`,
      body: t`Send the link of your game to five friends and ask them one question: when did you want to stop?`,
    },
    {
      title: t`Show it to other creators`,
      body: t`Post your game on the GDevelop Discord and forum. Creators play each other's games and give precise feedback.`,
    },
    {
      title: t`Work on the first impression`,
      body: t`On gd.games, players choose from a thumbnail and a title. Pick a screenshot that shows the game being played.`,
    },
    {
      title: t`Post a short clip`,
      body: t`Ten seconds of gameplay on social networks reach more people than a link alone.`,
    },
    {
      title: t`Join a game jam`,
      body: t`Jam entries get played and rated by the other participants: a guaranteed first audience.`,
    },
    {
      title: t`Describe it in one sentence`,
      body: t`"You are X and you must Y." A description that says what the player does gets more clicks than one that describes the story.`,
    },
    {
      title: t`Play other creators' games`,
      body: t`Play and comment on games on gd.games. Creators often return the visit, and you will see what works in games like yours.`,
    },
    {
      title: t`Share the making of`,
      body: t`Post screenshots and short updates while you build, not only the finished game. People follow a project they have seen grow.`,
    },
    {
      title: t`Ask one precise question`,
      body: t`"Is the first level too hard?" gets more answers than "What do you think?", and brings people into the game to find out.`,
    },
    {
      title: t`Put the link where you already are`,
      body: t`Add the link of your game to your profiles and signatures on the communities you use. It works for you every time you post.`,
    },
  ],
};

const oneDayInMs = 24 * 60 * 60 * 1000;

/**
 * The weekly email picks its tip from the Monday of the week it reports:
 * the same tip is picked here during the week after.
 */
const getTipIndex = (todayDate: Date, tipsCount: number): number => {
  const todayTimestamp = todayDate.getTime();
  const daysCountSinceMonday = (new Date(todayTimestamp).getUTCDay() + 6) % 7;
  const lastWeekMondayTimestamp =
    Math.floor(todayTimestamp / oneDayInMs) * oneDayInMs -
    (daysCountSinceMonday + 7) * oneDayInMs;
  return Math.floor(lastWeekMondayTimestamp / (7 * oneDayInMs)) % tipsCount;
};

type Props = {|
  i18n: I18nType,
  game: Game,
  gameAnalytics: GameAnalytics,
  todayDate?: Date,
|};

const GameAnalyticsAdvice = ({
  i18n,
  game,
  gameAnalytics,
  todayDate,
}: Props): React.Node => {
  const [
    marketingPlansDialogOpen,
    setMarketingPlansDialogOpen,
  ] = React.useState<boolean>(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { insight, summary, retentionDays } = gameAnalytics;
  const insightTips = insight !== 'readyToGrow' ? tips[insight] : null;
  const tip = insightTips
    ? insightTips[getTipIndex(todayDate || new Date(), insightTips.length)]
    : null;

  return (
    <Paper
      background="medium"
      variant="outlined"
      style={{ ...styles.paper, borderColor: gdevelopTheme.chart.dataColor1 }}
    >
      <ResponsiveLineStackLayout
        noMargin
        alignItems="center"
        justifyContent="space-between"
      >
        <LineStackLayout noMargin alignItems="center" expand>
          <div
            style={{
              ...styles.iconContainer,
              backgroundColor: gdevelopTheme.credits.backgroundColor,
              color: gdevelopTheme.credits.color,
            }}
          >
            <LampBulb />
          </div>
          <Column noMargin expand>
            <ColumnStackLayout noMargin>
              <Text noMargin size="sub-title">
                {insight === 'highBounce' &&
                summary.bounceRatePercent !== null ? (
                  <Trans>
                    {Math.round(summary.bounceRatePercent)}% of players leave in
                    the first minute, more than on most GDevelop games.
                  </Trans>
                ) : insight === 'lowRetention' && retentionDays ? (
                  <Trans>
                    Players try your game, but only{' '}
                    {formatPercent(retentionDays[0].retentionPercent)} of new
                    players come back the next day.
                  </Trans>
                ) : insight === 'readyToGrow' ? (
                  <Trans>
                    Your game holds attention better than most GDevelop games.
                  </Trans>
                ) : (
                  <Trans>
                    With {minPlayersCountForRates} players in the period, you
                    will see how long they stay and whether they come back.
                  </Trans>
                )}
              </Text>
              {tip ? (
                <Text noMargin color="secondary">
                  <b>{i18n._(tip.title)}.</b> {i18n._(tip.body)}
                </Text>
              ) : (
                <Text noMargin color="secondary">
                  <Trans>
                    <b>Time to find more players.</b> More visibility is now the
                    best use of your time: share your game, post it in
                    communities, or put it in front of thousands of players on
                    gd.games with a Marketing Boost.
                  </Trans>
                </Text>
              )}
            </ColumnStackLayout>
          </Column>
        </LineStackLayout>
        {insight === 'readyToGrow' && (
          <FlatButton
            primary
            label={<Trans>See Marketing Boosts</Trans>}
            onClick={() => setMarketingPlansDialogOpen(true)}
          />
        )}
        {insight === 'fewPlayers' && (
          <FlatButton
            primary
            label={<Trans>How to publish and share</Trans>}
            onClick={() => Window.openExternalURL(publishingHelpLink)}
          />
        )}
      </ResponsiveLineStackLayout>
      {marketingPlansDialogOpen && (
        <MarketingPlansDialog
          game={game}
          onClose={() => setMarketingPlansDialogOpen(false)}
        />
      )}
    </Paper>
  );
};

export default GameAnalyticsAdvice;

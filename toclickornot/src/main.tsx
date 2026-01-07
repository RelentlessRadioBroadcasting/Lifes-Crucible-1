import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Clickablelife',
  height: 'tall',
  render: (_context) => {
    return (
      <vstack height="100%" width="100%" alignment="center middle">
        <text size="xxlarge" weight="bold">Click Life Away</text>
        <text size="medium">An Existential Experience</text>
        <spacer size="medium" />
        <button onPress={() => {}}>Start Playing</button>
      </vstack>
    );
  },
});

export default Devvit;

import { reddit } from '@devvit/web/server';

const post = await reddit.submitCustomPost({
  subredditName: context.subredditName!,
  title: 'My Interactive Post',
  splash: {
    appDisplayName: 'Clickablelife',
    backgroundUri: 'background.png',
    buttonLabel: 'Start Playing',
    description: 'An Existental Experience',
    entryUri: 'index.html',
    heading: 'Welcome to the Game!'
  },
  postData: {
    gameState: 'initial',
    score: 50
  }
});

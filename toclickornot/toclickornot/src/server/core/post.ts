import { reddit, context } from "@devvit/web/server";

export const createPost = async () => {
  const date = (new Date()).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return await reddit.submitCustomPost({
    subredditName: context.subredditName ?? 'test',
    title: `TO CLICK OR NOT: ${date}`,
    splash: {
      appDisplayName: 'TO CLICK OR NOT',
      backgroundUri: '/splash-background.png',
      buttonLabel: 'Begin Journey',
      description: `${date}'s game`,
      entryUri: 'splash.html',
      heading: 'Welcome to the Game!',
      appIconUri: 'default-icon.png',
    }
  });
};

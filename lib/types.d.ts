type RssDownloader = {
  readonly downloadRss: () => Promise<string>;
};

type FeedItem = {
  title: string;
  link: string;
};

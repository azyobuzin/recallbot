export type FeedItem = {
  title: string;
  link: string;
};

export type PdfLink = {
  title: string;
  href: string;
};

export type PostedUrl = {
  url: string;
  createdAt: number; // Unix seconds
};

export type RecallDetails = {
  component: string;
  situation: string;
  numCars: number;
};

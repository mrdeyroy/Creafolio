export interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  category: string;
  description: string;
  image: string;
  icon: string;
  tags: string[];
  pinned: boolean;
  createdAt: number;
}

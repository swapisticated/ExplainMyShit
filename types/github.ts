export type Label = {
  id: number;
  name: string;
  color: string;
  description?: string;
};

export type User = {
  login: string;
  avatar_url: string;
};

export type Issue = {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: User;
  comments: number;
  url: string;
  labels: Label[];
};

export type PullRequest = Issue & {
  merged: boolean;
  mergeable: boolean | null;
  draft: boolean;
};
export interface IApiResults {
  info: IPagesInfo;
  results: ICharacter[];
}

export interface IPagesInfo {
  count: number;
  next: string;
  pages: number;
  prev: string;
}
export interface ICharacter {
  created: string;
  episode: string[];
  gender: string;
  id: number;
  image: string;
  location: {
    name: string,
    url: string
  };
  name: string;
  origin: {
    name: string,
    url: string
  };
  species: string;
  status: string;
  type: string;
  url: string;
}
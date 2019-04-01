import { from, fromEvent, Observable, Observer } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { IApiResults, ICharacter, IPagesInfo } from './interfaces';
import './style.css';

const inputElement: HTMLInputElement = document.querySelector('#refInput') as HTMLInputElement;
const API: string = 'https://rickandmortyapi.com/api/';
const characters: string = 'character/';
let restApi: Promise<IApiResults>;
let pageId: number = 1;
let filterValue: string = '';

const getUrl: Function = () => `${API}${characters}?page=${pageId}&name=${filterValue}`;

const createApiRequest$: Observable<string> = Observable.create((observer: Observer<string>) => {
  const parentObserver: Observer<string> = observer;

  parentObserver.next(getUrl());

  filterValue$.subscribe((response: string) => {
    pageId = 1;
    filterValue = response;
    parentObserver.next(getUrl());
  });

  clicks$.subscribe((response: any) => {
    const item: HTMLDivElement = response.target.closest('.item');

    if (response.target.nodeName === 'LI' && response.target.closest('.pagination')) {
      const value: string = response.target.innerHTML;

      restApi.then((result: IApiResults) => {
        if (value === 'next') {
          pageId++;
          parentObserver.next(result.info[value]);
        } else if (value === 'prev') {
          pageId--;
          parentObserver.next(result.info[value]);
        } else {
          pageId = +value;
          parentObserver.next(getUrl());
        }
      });
    }
    if (item) {
      parentObserver.next(item.dataset.url);
    }
  });
});

const filterValue$: Observable<string> = fromEvent(inputElement, 'input').pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  debounceTime(500)
);

const clicks$: Observable<Event> = fromEvent(document, 'click');

createApiRequest$.subscribe((response: string) => {
  const charactersResult$: Observable<IApiResults> = from(fetch(response)
    .then((result: Response) => {
      restApi = result.json();
      return restApi;
    }));

  charactersResult$.subscribe((responseApi: IApiResults) => {
    const pageResults: ICharacter[] = responseApi.results;
    const info: IPagesInfo = responseApi.info;

    createPagination(info);
    createCharacters(pageResults);
  }, (err: Error) => alert(err));
});

const createPagination: Function = (info: IPagesInfo) => {
  const totalPages: number = info ? info.pages : 1;
  const nextPage: string = info ? info.next : '';
  const prevPage: string = info ? info.prev : '';
  const pagination: HTMLDivElement = document.querySelector('.pagination') as HTMLDivElement;
  const paginationList: HTMLUListElement = document.createElement('ul');
  const totalValue: HTMLDivElement = document.querySelector('.total-pages') as HTMLDivElement;
  const currentValue: HTMLDivElement = document.querySelector('.current-page') as HTMLDivElement;

  pagination.innerHTML = '';
  totalValue.innerHTML = `${totalPages}`;
  currentValue.innerHTML = `${pageId}`;
  pagination.appendChild(paginationList);


  if (prevPage) {
    const prevElement: HTMLLIElement = document.createElement('li');

    paginationList.appendChild(prevElement).innerHTML = 'prev';
  }
  if (totalPages > 1) {
    for (let index: number = 1; index <= totalPages; index++) {
      if (pageId <= index + 1 && pageId >= index - 1) {
        const listElement: HTMLLIElement = document.createElement('li');

        paginationList.appendChild(listElement).innerHTML = `${index}`;

        if (pageId === index) {
          listElement.className = 'active';
        }
      }
    }
  }
  if (nextPage) {
    const nextElement: HTMLLIElement = document.createElement('li');

    paginationList.appendChild(nextElement).innerHTML = 'next';
  }
};

const createCharacters: Function = (data: ICharacter[]) => {
  const wrapperElement: HTMLDivElement = document.querySelector('.items') as HTMLDivElement;
  const items: ICharacter[] = data;

  wrapperElement.innerHTML = '';

  items.forEach((item: ICharacter) => {
    const listElement: HTMLDivElement = document.createElement('div');
    listElement.className = 'item';
    wrapperElement.appendChild(listElement);
    listElement.dataset.url = item.url;
    listElement.innerHTML = `
      <div class="image-holder">
        <div class="text-holder">
          <span class="name">${item.name}</span>
          <!-- Дата создания - ${item.created} <br /> -->
          <!-- ${item.episode} <br /> -->
          <dl>
            <dt>Пол - </dt>
            <dd>${item.gender}</dd>
          </dl>
          <dl>
            <dt>ID - </dt>
            <dd>${item.id}</dd>
          </dl>
        </div>
        <img src=${item.image} alt="" /> <br />
      </div>
      <div class="info">
        <dl>
          <dt>LOCATION</dt>
          <dd>${item.location.name}</dd>
        </dl>
        <dl>
          <dt>origin</dt>
          <dd>${item.origin.name}</dd>
        </dl>
        <dl>
          <dt>species</dt>
          <dd>${item.species}</dd>
        </dl>
        <dl>
          <dt>Статус</dt>
          <dd>${item.status}</dd>
        </dl>
        <dl>
          <dt>Способности</dt>
          <dd>${item.type ? item.type : 'Нету'}</dd>
        </dl>
      </div>
    `;
  });
};

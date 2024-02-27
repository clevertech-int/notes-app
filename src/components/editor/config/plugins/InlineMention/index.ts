import { API } from '@editorjs/editorjs';
import { mentionsService, socket } from '@notes/data';
import { TMention, TBlock, TUser } from '@notes/types';

export default class InlineMention {
  private api: API;
  private _state: boolean;
  private nodes: {
    input: HTMLInputElement | null;
    userList: HTMLElement | null;
    anchor: HTMLAnchorElement | null;
  };
  private wrapper: HTMLElement | undefined;

  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      a: {
        href: true,
        rel: true,
      },
    };
  }

  get state() {
    return this._state;
  }

  set state(state) {
    this._state = state;
  }

  get CSS() {
    return {
      input: 'ce-inline-tool-input',
      inputShowed: 'ce-inline-tool-input--showed',
      ul: 'tiny',
      liActive: 'bg-muted',
    };
  }

  constructor({ api }: { api: API }) {
    this.api = api;
    this._state = false;
    this.nodes = {
      input: null,
      userList: null,
      anchor: null,
    };
  }

  render() {
    return document.createElement('span');
  }

  surround(range: any) {
    console.log('surround', range);
  }

  checkState() {
    const a = this.api.selection.findParentTag('A') as HTMLAnchorElement;

    this.state = a.rel === 'tag';

    if (this.state) {
      this.showActions(a);
    } else {
      this.hideActions();
    }
  }

  renderActions() {
    this.wrapper = document.createElement('div');
    this.nodes.input = document.createElement('input');
    this.nodes.input.placeholder = 'Search for a user';
    this.nodes.input.classList.add(this.CSS.input);
    this.nodes.input.addEventListener('input', (e: Event) => {
      this.getMentions((e.target as HTMLInputElement).value);
    });
    this.nodes.input.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        this.enterPressed(event);
      }
      if (event.keyCode === 40 || event.keyCode === 38) {
        this.downOrUpPressed(event);
      }
    });
    this.wrapper.appendChild(this.nodes.input);
    return this.wrapper;
  }

  async createNewTag(user: TUser): Promise<TMention> {
    return socket.emitWithAck('createTag', user);
  }

  getMentions(q?: string) {
    mentionsService.getMentions(q).then((users) => {
      console.log('users', users);
      if (this.nodes.userList) {
        this.nodes.userList.innerHTML = '';
      }

      users.forEach((user, i) => {
        const li = document.createElement('li');
        li.innerHTML = mentionsService.outputTemplate(user);
        if (i === 0) {
          li.classList.add(this.CSS.liActive);
        }
        li.addEventListener('click', async (e) => {
          e.preventDefault();

          if (!this.nodes.anchor) {
            return;
          }

          const a = this.nodes.anchor;
          if (user.id === '0') {
            const data = await this.createNewTag(user);
            a.innerHTML = '@' + user.name;
            a.href = data.uuid;
          } else {
            a.innerHTML = '@' + user.name;
            a.href = user.id;
          }
          a.addEventListener('click', async (e) => {
            console.log('Click ...');
            e.preventDefault();
            const refs = document.getElementById('refs');
            console.log({ refs });
            if (refs) {
              refs.innerHTML = '';
              // check if this is correct
              const id = (e.target as HTMLAnchorElement).href.replace('http://localhost:3000/', '');
              const items = await socket.emitWithAck('searchNoteBlocks', { uuid: id });

              items.forEach((i: any) => {
                const el = document.createElement('li');
                el.innerHTML = `<a href="#">[note#${i.noteId}]</a> ${i.text}`;
                refs.appendChild(el);
              });
            }
          });

          a.insertAdjacentHTML('afterend', '&nbsp;');
          this.setCursor(a.nextSibling as Node, 1);
        });
        if (this.nodes.userList) {
          this.nodes.userList.appendChild(li);
        }
      });
    });
  }

  enterPressed(event: KeyboardEvent) {
    event.preventDefault();
    const firstLi = this.nodes.userList?.querySelector(`li.${this.CSS.liActive}`) as HTMLElement;
    if (!firstLi) {
      return;
    }

    firstLi.click();
  }

  downOrUpPressed(event: KeyboardEvent) {
    event.preventDefault();
    const currentLi = this.nodes.userList?.querySelector(`li.${this.CSS.liActive}`);
    const nextLi = (
      event.keyCode === 40 ? currentLi?.nextSibling : currentLi?.previousSibling
    ) as HTMLElement;
    if (nextLi) {
      currentLi?.classList.remove(this.CSS.liActive);
      nextLi.classList.add(this.CSS.liActive);
    }
  }

  showActions(a: HTMLAnchorElement) {
    if (this.nodes.userList) {
      return;
    }

    document.querySelector(`.${this.CSS.inputShowed}`)?.remove();
    if (a.href) {
      return;
    }

    this.nodes.anchor = a;

    this.nodes.input?.classList.add(`${this.CSS.inputShowed}`);
    setTimeout(() => {
      this.nodes.input?.focus();
    });

    this.nodes.userList = document.createElement('ul');
    this.nodes.userList.classList.add(this.CSS.ul);
    this.wrapper?.appendChild(this.nodes.userList);
    this.getMentions();
  }

  hideActions() {
    if (this.nodes.input) {
      this.nodes.input.classList.remove(this.CSS.inputShowed);
      this.nodes.input.value = '';
      this.nodes.anchor = null;
      if (this.nodes.userList) {
        this.nodes.userList.remove();
        this.nodes.userList = null;
      }
    }
  }

  clear() {
    this.hideActions();
  }

  setCursor(element: Node, offset: number) {
    const range = document.createRange();
    const selection = window.getSelection();

    range.setStart(element, offset);
    range.setEnd(element, offset);

    selection?.removeAllRanges();
    selection?.addRange(range);

    return range.getBoundingClientRect();
  }
}

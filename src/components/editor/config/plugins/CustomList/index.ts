import { API } from '@editorjs/editorjs';
import NestedList from '@editorjs/nested-list';

type ListItem = {
  content: string;
  items: ListItem[];
  style: string;
};

type ListProps = {
  data: ListItem;
  config: {
    defaultStyle: string;
  };
  api: API;
  readOnly: boolean;
};

type CreateElementWithAttrsType = (tagName: string, classNames?: string | string[]) => HTMLElement;

const createElementWithAttrs: CreateElementWithAttrsType = (tagName, classNames = undefined) => {
  const el: HTMLElement = document.createElement(tagName);

  if (Array.isArray(classNames)) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.classList.add(classNames);
  }

  return el;
};

export default class CustomList extends NestedList {
  private nodes: {
    wrapper: HTMLElement;
  };
  private readOnly: boolean;
  private config: {
    defaultStyle: string;
  };
  private defaultListStyle: string;
  private data: ListItem;

  static get pasteConfig() {
    return {
      tags: [
        'UL',
        'OL',
        {
          li: { style: true },
        },
      ],
    };
  }

  pasteHandler(element: HTMLElement) {
    const { tagName: tag = 'UL' } = element;

    const data: ListItem = {
      content: '',
      style: tag === 'OL' ? 'ordered' : 'unordered',
      items: [],
    };

    const getPastedItems = (parent: Element): ListItem[] => {
      const children = Array.from(parent.querySelectorAll(`:scope > li`));

      return children.map((child) => {
        const subItemsWrapper = child.querySelector(`:scope > ul, :scope > ol`);
        const subItems = subItemsWrapper ? getPastedItems(subItemsWrapper) : [];

        const nextElement = child.nextSibling as Element;
        if (nextElement && ['UL', 'OL'].includes(nextElement.tagName)) {
          subItems.push(...getPastedItems(nextElement));
        }

        const content = child?.innerHTML || '';

        return {
          content,
          items: subItems,
          style: nextElement?.tagName === 'OL' ? 'ordered' : 'unordered',
        };
      });
    };

    try {
      data.items = getPastedItems(element);
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  appendItems(items: ListItem[], parentItem: HTMLElement): void {
    items.forEach((item) => {
      const itemEl = this.createItem(item.content, item.items, item.style);

      parentItem.appendChild(itemEl);
    });
  }

  createItem(content: string, items: ListItem[] = [], style: string) {
    const itemWrapper = createElementWithAttrs('li', super.CSS.item);
    const itemBody = createElementWithAttrs('div', super.CSS.itemBody);
    const itemContent = createElementWithAttrs('div', super.CSS.itemContent);
    itemContent.innerHTML = content;
    itemContent.contentEditable = `${!this.readOnly}`;

    itemBody.appendChild(itemContent);
    itemWrapper.appendChild(itemBody);

    if (items && items.length > 0) {
      this.addChildrenList(itemWrapper, items, style);
    }

    return itemWrapper;
  }

  addChildrenList(parentItem: HTMLElement, items: ListItem[], style: string) {
    const itemBody = parentItem.querySelector(`.${super.CSS.itemBody}`);
    const sublistWrapper = super.makeListWrapper(style, [super.CSS.itemChildren]);

    this.appendItems(items, sublistWrapper);

    itemBody?.appendChild(sublistWrapper);
  }

  save() {
    console.log(this.data);

    const getItems = (parent: Element): ListItem[] => {
      const children = Array.from(parent.querySelectorAll(`:scope > .${super.CSS.item}`));

      return children.map((el) => {
        const subItemsWrapper = el.querySelector(`.${super.CSS.itemChildren}`);
        const content = super.getItemContent(el) || '';
        const subItems = subItemsWrapper ? getItems(subItemsWrapper) : [];

        return {
          content,
          items: subItems,
          style: subItemsWrapper?.tagName === 'OL' ? 'ordered' : 'unordered',
        };
      });
    };

    return {
      style: this.data.style,
      items: getItems(this.nodes.wrapper),
    };
  }

  constructor({ data, config, api, readOnly }: ListProps) {
    super({ data, config, api, readOnly });
    this.nodes = {
      wrapper: document.createElement('div'),
    };

    this.readOnly = readOnly;
    this.config = config;

    this.defaultListStyle = this.config.defaultStyle === 'ordered' ? 'ordered' : 'unordered';

    const initialData = {
      content: '',
      style: this.defaultListStyle,
      items: [],
    };
    this.data = data && Object.keys(data).length ? data : initialData;
  }
}

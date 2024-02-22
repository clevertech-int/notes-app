import { API, BlockAPI, InlineTool, ToolConfig } from '@editorjs/editorjs';

import './index.css';

type Alignment = 'left' | 'center' | 'right' | 'justify';

type AlignmentData = { alignment: Alignment };

type AlignmentOption = {
  name: Alignment;
  icon: string;
};

type AlignmentToolProps = {
  api: API;
  data: AlignmentData;
  config: ToolConfig;
  block: BlockAPI;
};

export default class AlignmentTool implements InlineTool {
  public static title = 'Alignment';

  private api: API;
  private data: AlignmentData;
  private settings: ToolConfig;
  private block: BlockAPI;
  private alignmentSettings: AlignmentOption[];

  static get isInline() {
    return true;
  }

  getAlignment() {
    // eslint-disable-next-line no-prototype-builtins
    if (!!this.settings?.blocks && this.settings.blocks.hasOwnProperty(this.block.name)) {
      return this.settings.blocks[this.block.name];
    }
    if (this.settings?.default) {
      return this.settings.default;
    }
    return 'left';
  }

  constructor({ api, data, config, block }: AlignmentToolProps) {
    this.api = api;
    this.block = block;
    this.settings = config;
    this.data = data || { alignment: this.getAlignment() };
    this.alignmentSettings = [
      {
        name: 'left',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-left"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>`,
      },
      {
        name: 'center',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-center"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>`,
      },
      {
        name: 'right',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-right"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>`,
      },
      {
        name: 'justify',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-justify"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>`,
      },
    ];
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('editor-alignment-container');
    this.alignmentSettings
      .map((align) => {
        const button = document.createElement('button');
        button.classList.add(this.api.styles.settingsButton);
        button.setAttribute('id', `ce-button--${align.name}`);
        button.innerHTML = align.icon;
        button.type = 'button';

        button.classList.toggle(
          this.api.styles.settingsButtonActive,
          align.name === this.data.alignment,
        );
        wrapper.appendChild(button);
        return button;
      })
      .forEach((element, index) => {
        element.addEventListener('click', () => {
          this.data = {
            alignment: this.alignmentSettings[index]?.name || 'left',
          };
        });
      });
    return wrapper;
  }

  surround(range: Range) {
    if (!range) {
      return;
    }

    const termWrapper = this.api.selection.findParentTag(
      'span',
      `ce-alignment--${this.data.alignment}`,
    );

    if (!termWrapper) {
      this.wrap(range);
    }
  }

  getBlockElement(container?: HTMLElement | null) {
    const isValidElement = (classList?: DOMTokenList) => {
      const possibleContainers = [
        'ce-paragraph',
        'tc-cell',
        'ce-header',
        'cdx-nested-list__item-content',
        'cdx-checklist__item-text',
      ];
      let isValid = false;
      possibleContainers.forEach((className) => {
        if (classList?.contains(className)) {
          isValid = true;
        }
      });
      return isValid;
    };

    let currentElement: HTMLElement | undefined | null = container;

    while (currentElement) {
      if (isValidElement(currentElement.classList)) {
        break;
      }
      currentElement = currentElement?.parentElement;
    }

    return currentElement;
  }

  getExistAlignment(innerHTML?: string | null) {
    const possibleClasses = this.alignmentSettings.map((align) => `ce-alignment--${align.name}`);
    let has = '';
    possibleClasses.forEach((className) => {
      if (innerHTML?.includes(className)) {
        has = className;
      }
    });
    return has;
  }

  wrap(range: Range) {
    const container = this.getBlockElement(range.commonAncestorContainer as HTMLElement);

    if (container) {
      let content = container.innerHTML;
      const alignmentClass = this.getExistAlignment(content);

      if (alignmentClass) {
        content = content.replace(alignmentClass, `ce-alignment--${this.data.alignment}`);
        container.innerHTML = content;
      } else {
        container.innerHTML = `<span class="ce-alignment--${this.data.alignment}">${content}</span>`;
      }

      this.api.selection.expandToTag(container.firstChild as HTMLElement);
    }
  }

  checkState(selection: Selection) {
    const container = this.getBlockElement(selection.anchorNode as HTMLElement);
    const alignmentClass = this.getExistAlignment(container?.innerHTML);
    if (alignmentClass) {
      this.data = {
        alignment: alignmentClass.replace('ce-alignment--', '') as Alignment,
      };
    }

    this.alignmentSettings.forEach((align) => {
      const button = document.getElementById(`ce-button--${align.name}`);
      button?.classList.toggle(
        this.api.styles.settingsButtonActive,
        align.name === this.data.alignment,
      );
    });
    return true;
  }
}

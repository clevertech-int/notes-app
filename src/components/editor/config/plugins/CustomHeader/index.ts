import { API, PasteEvent } from '@editorjs/editorjs';
import { ReadOnly } from '@editorjs/editorjs/types/api';

import { IconH1, IconH2, IconH3, IconH4, IconH5, IconH6, IconHeading } from './icons';
import { v4 as uuid } from 'uuid';

import './index.css';

import {
  HeaderConfig,
  HeaderConstructorProps,
  HeaderConversionConfig,
  HeaderData,
  HeaderLevel,
  HeaderPasteConfig,
  HeaderSettingLevel,
  HeaderToolbox,
} from './types';

export default class Header {
  private api: API;
  private readOnly: ReadOnly;
  private _CSS: {
    block: string;
    wrapper: string;
  };
  private _settings: HeaderConfig;
  private _data: HeaderData;
  private _element: HTMLElement;

  constructor({ data, config, api, readOnly }: HeaderConstructorProps) {
    this.api = api;
    this.readOnly = readOnly;

    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-header',
    };

    this._settings = config;

    this._data = this.normalizeData(data);

    this._element = this.getTag();
  }

  normalizeData(data: HeaderData): HeaderData {
    const newData: HeaderData = {};

    if (typeof data !== 'object') {
      data = {};
    }

    newData.id = data.id || this.convertToId(data.text || '');
    newData.text = data.text || '';
    newData.level = parseInt(`${data.level}`) || this.defaultLevel.number;

    return newData;
  }

  render(): HTMLElement {
    return this._element;
  }

  renderSettings(): HeaderSettingLevel[] {
    return this.levels.map((level) => ({
      icon: level.svg,
      label: this.api.i18n.t(`Heading ${level.number}`),
      onActivate: () => this.setLevel(level.number),
      closeOnActivate: true,
      isActive: this.currentLevel.number === level.number,
    }));
  }

  setLevel(level: number): void {
    this.data = {
      id: this.data.id || this.convertToId(`${this.data.text}`),
      level: level,
      text: this.data.text,
    };
  }

  merge(data: HeaderData): void {
    const text = `${this.data.text || ''}${data.text || ''}`;

    const newData = {
      id: this.data.id || this.convertToId(text),
      text,
      level: this.data.level,
    };

    this.data = newData;
  }

  validate(blockData: HeaderData): boolean {
    return blockData.text?.trim() !== '';
  }

  save(toolsContent: HTMLElement): HeaderData {
    return {
      id: this._data.id || this.convertToId(toolsContent.innerHTML),
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
    };
  }

  static get conversionConfig(): HeaderConversionConfig {
    return { export: 'text', import: 'text' };
  }

  static get sanitize() {
    return {
      level: false,
      text: {},
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  get data(): HeaderData {
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;

    return this._data;
  }

  set data(data: HeaderData) {
    this._data = this.normalizeData(data);

    if (data.level !== undefined && this._element.parentNode) {
      const newHeader = this.getTag();
      newHeader.innerHTML = this._element.innerHTML;
      this._element.parentNode.replaceChild(newHeader, this._element);
      this._element = newHeader;
    }

    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || '';
    }
  }

  convertToId(text: string): string {
    const slug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    return `${slug}-${uuid()}`;
  }

  getTag(): HTMLElement {
    const tag = document.createElement(this.currentLevel.tag);

    tag.innerHTML = this._data.text || '';
    tag.classList.add(this._CSS.wrapper);
    tag.id = this._data.id || this.convertToId(this._data.text || '');
    tag.contentEditable = this.readOnly ? 'false' : 'true';
    tag.dataset['placeholder'] = this.api.i18n.t(this._settings.placeholder || '');

    return tag;
  }

  get currentLevel(): HeaderLevel {
    let level = this.levels.find((levelItem) => levelItem.number === this._data.level);

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  get defaultLevel(): HeaderLevel {
    if (this._settings.defaultLevel) {
      const userSpecified = this.levels.find((levelItem) => {
        return levelItem.number === this._settings.defaultLevel;
      });

      if (userSpecified) {
        return userSpecified;
      } else {
        console.warn(
          "(ง'̀-'́)ง Heading Tool: the default level specified was not found in available levels",
        );
      }
    }

    return this.levels[1] as HeaderLevel;
  }

  get levels(): HeaderLevel[] {
    const availableLevels = [
      {
        number: 1,
        tag: 'H1',
        svg: IconH1,
      },
      {
        number: 2,
        tag: 'H2',
        svg: IconH2,
      },
      {
        number: 3,
        tag: 'H3',
        svg: IconH3,
      },
      {
        number: 4,
        tag: 'H4',
        svg: IconH4,
      },
      {
        number: 5,
        tag: 'H5',
        svg: IconH5,
      },
      {
        number: 6,
        tag: 'H6',
        svg: IconH6,
      },
    ];

    return this._settings.levels
      ? availableLevels.filter((l) => this._settings.levels.includes(l.number))
      : availableLevels;
  }

  onPaste(event: PasteEvent | any) {
    const content = event.detail.data;

    let level = this.defaultLevel.number;

    switch (content.tagName) {
      case 'H1':
        level = 1;
        break;
      case 'H2':
        level = 2;
        break;
      case 'H3':
        level = 3;
        break;
      case 'H4':
        level = 4;
        break;
      case 'H5':
        level = 5;
        break;
      case 'H6':
        level = 6;
        break;

      default:
        level = 1;
        break;
    }

    if (this._settings.levels) {
      level = this._settings.levels.reduce((prevLevel, currLevel) => {
        return Math.abs(currLevel - level) < Math.abs(prevLevel - level) ? currLevel : prevLevel;
      });
    }

    this.data = {
      level,
      id: this.convertToId(content.innerText || ''),
      text: content.innerText,
    };
  }

  static get pasteConfig(): HeaderPasteConfig {
    return {
      tags: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
    };
  }

  static get toolbox(): HeaderToolbox {
    return {
      icon: IconHeading,
      title: 'Heading',
    };
  }
}

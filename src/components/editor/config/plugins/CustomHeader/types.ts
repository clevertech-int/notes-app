import { API } from '@editorjs/editorjs';
import { ReadOnly } from '@editorjs/editorjs/types/api';

export type HeaderData = {
  id?: string;
  text?: string;
  level?: number;
};

export type HeaderConfig = {
  placeholder: string;
  levels: number[];
  defaultLevel: number;
};

export type HeaderLevel = {
  number: number;
  tag: string;
  svg: string;
};

export type HeaderSettingLevel = {
  icon: string;
  label: string;
  onActivate: () => void;
  closeOnActivate: boolean;
  isActive: boolean;
};

export type HeaderConversionConfig = {
  export: string;
  import: string;
};

export type HeaderToolbox = {
  icon: string;
  title: string;
};

export type HeaderPasteConfig = {
  tags: string[];
};

export type HeaderConstructorProps = {
  data: HeaderData;
  config: HeaderConfig;
  api: API;
  readOnly: ReadOnly;
};

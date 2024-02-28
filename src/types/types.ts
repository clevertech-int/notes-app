import { OutputBlockData } from '@editorjs/editorjs';

export type TMention = {
  uuid: string;
  name: string;
};

export type TUser = {
  id: string;
  name: string;
};

export type TBlock = {
  noteId: string;
  text: string;
};

export type TNote = {
  id: string;
  author: string;
};

export type TNoteContent = {
  blocks: OutputBlockData[];
  noteId: string;
};

export type TTag = {
  noteId: string;
  body: string;
};

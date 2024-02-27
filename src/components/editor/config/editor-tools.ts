import Header from './plugins/CustomHeader';
import CustomParagraph from './plugins/CustomParagraph';
import CustomList from './plugins/CustomList';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Underline from '@editorjs/underline';
import CodeTool from '@editorjs/code';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import Raw from '@editorjs/raw';
import ColorPlugin from 'editorjs-text-color-plugin';
import Strikethrough from '@sotaproject/strikethrough';
import { IconH1, IconH2, IconOrderedList, IconUnorderedList } from './plugins/CustomHeader/icons';
import CustomAlignment from './plugins/CustomAlignment';
// import ImageTool from '@editorjs/image';
import CheckList from '@editorjs/checklist';
import { IconBrandYoutube } from '@tabler/icons-react';
import InlineMention from './plugins/InlineMention';

export const editorConfig = {
  underline: {
    class: Underline,
    shortcut: 'CMD+U',
  },
  strikethrough: Strikethrough,
  Color: {
    class: ColorPlugin,
    config: {
      colorCollections: [
        '#EC7878',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#0070FF',
        '#03A9F4',
        '#00BCD4',
        '#4CAF50',
        '#8BC34A',
        '#CDDC39',
        '#FFF',
      ],
      defaultColor: '#000',
      type: 'text',
      customPicker: true,
    },
  },
  Marker: {
    class: Marker,
    shortcut: 'CMD+ALT+M',
  },
  inlineCode: {
    class: InlineCode,
    shortcut: 'CMD+ALT+C',
  },
  Alignment: CustomAlignment,
  paragraph: {
    class: CustomParagraph,
    inlineToolbar: true,
  },
  header: {
    class: Header,
    toolbox: [
      {
        title: 'Title',
        subtitle: 'Description',
        icon: IconH1,
        data: {
          level: 2,
        },
      },
    ],
    shortcut: 'CMD+ALT+T',
    inlineToolbar: true,
    config: {
      levels: [2],
      defaultLevel: 2,
    },
  },
  subtitle: {
    class: Header,
    toolbox: [
      {
        title: 'Subtitle',
        icon: IconH2,
        data: {
          level: 3,
        },
      },
    ],
    shortcut: 'CMD+ALT+J',
    inlineToolbar: true,
    config: {
      levels: [3],
      defaultLevel: 3,
    },
  },
  checklist: {
    class: CheckList,
    inlineToolbar: true,
  },
  ordered: {
    class: CustomList,
    toolbox: [
      {
        title: 'Ordered List',
        icon: IconOrderedList,
        data: {
          style: 'ordered',
        },
      },
    ],
    shortcut: 'CMD+ALT+L',
    inlineToolbar: true,
    config: {
      defaultStyle: 'ordered',
    },
  },
  list: {
    class: CustomList,
    toolbox: [
      {
        title: 'Unordered List',
        icon: IconUnorderedList,
        data: {
          style: 'unordered',
        },
      },
    ],
    shortcut: 'CMD+ALT+8',
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered',
    },
  },
  embed: {
    class: Embed,
    toolbox: [
      {
        icon: IconBrandYoutube,
      },
    ],
    config: {
      services: {
        youtube: true,
        vimeo: true,
        zoom: {
          regex: /(?:https?:\/\/)?([^/?&.]*)?(?:\.?zoom\.us\/rec\/(play|share)\/)([^/]*)/i,
          embedUrl: '<%= remote_id %>',
          html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
          id: (groups: string[]) =>
            `https://${groups[0] ? `${groups[0]}.` : ''}zoom.us/rec/${groups[1]}/${groups[2]}`,
        },
        loom: {
          regex: /(?:https?:\/\/)?(?:www\.)?(?:loom\.com\/share)\/([^#&?=]*)([^]*)/i,
          embedUrl:
            'https://www.loom.com/embed/<%= remote_id %>?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
          html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
          id: (groups: string[]) => groups[0],
        },

        drive: {
          regex:
            /(?:https?:\/\/)?(?:www\.)?(?:docs\.google\.com\/spreadsheets\/d)\/e\/([^#&?=]*)([^]*)/i,
          embedUrl: 'https://docs.google.com/spreadsheets/d/e/<%= remote_id %>',
          html: "<iframe height='1000' scrolling='yes' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>",
          id: (groups: string[]) => groups[0],
        },
      },
    },
  },
  quote: {
    class: Quote,
    shortcut: 'CMD+ALT+.',
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Quote',
      captionPlaceholder: 'Quote`s author',
    },
  },
  // image: {
  //   class: ImageTool,
  //   config: {
  //     uploader: {
  //       async uploadByFile(file: Blob) {
  //         return uploadImage(file);
  //       },
  //       async uploadByUrl(url: string) {
  //         const blob = await fetch(url).then((r) => r.blob());
  //         return uploadImage(blob);
  //       },
  //     },
  //   },
  // },
  warning: {
    class: Warning,
    shortcut: 'CMD+ALT+1',
    inlineToolbar: true,
  },
  code: CodeTool,
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  raw: {
    class: Raw,
    inlineToolbar: true,
  },
  delimiter: Delimiter,

  inlineMention: InlineMention,
};

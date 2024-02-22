import { PasteEvent } from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';

export default class CustomParagraph extends Paragraph {
  private data!: any;

  static get sanitize() {
    return {
      text: {
        br: true,
        img: true,
        hr: true,
      },
    };
  }

  static get pasteConfig() {
    return {
      tags: [
        {
          p: { style: true },
        },
        {
          img: true,
        },
        {
          hr: true,
        },
      ],
    };
  }

  async onPaste(event: PasteEvent | any) {
    const element = event.detail.data;

    const alignment = element.style.textAlign;
    const content = element.innerHTML || element.outerHTML;

    const data = {
      text: alignment ? `<span class="ce-alignment--${alignment}">${content}</span>` : content,
    };

    this.data = data;
  }
}

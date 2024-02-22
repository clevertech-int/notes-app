import debounce from 'lodash/debounce';

export default class Observer {
  private observer: MutationObserver | null;
  private holder: HTMLElement | null;
  private mutationDebouncer: () => void;

  constructor(registerChange: () => void) {
    this.holder = document.getElementById('editorjs');
    this.observer = null;
    this.mutationDebouncer = debounce(() => {
      registerChange();
    }, 200);
  }

  setMutationObserver() {
    const observerOptions = {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    };

    const target = this.holder?.querySelector('.codex-editor__redactor');

    this.observer = new MutationObserver((mutationList) => {
      this.mutationHandler(mutationList);
    });
    this.observer.observe(target as Node, observerOptions);
  }

  mutationHandler(mutationList: MutationRecord[]) {
    let contentMutated = false;

    mutationList.forEach((mutation) => {
      switch (mutation.type) {
        case 'childList':
          if (mutation.target === this.holder) {
            this.onDestroy();
          } else {
            contentMutated = true;
          }
          break;
        case 'characterData':
          contentMutated = true;
          break;
        case 'attributes':
          if (
            !(mutation.target as HTMLElement).classList.contains('ce-block') &&
            !(mutation.target as HTMLElement).classList.contains('tc-toolbox')
          ) {
            contentMutated = true;
          }
          break;
        default:
          break;
      }
    });

    if (contentMutated) this.mutationDebouncer();
  }

  onDestroy() {
    const destroyEvent = new CustomEvent('destroy');
    document.dispatchEvent(destroyEvent);
    this.observer?.disconnect();
  }
}

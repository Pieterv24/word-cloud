import { html, LitElement, css } from '@lion/core';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LionInput } from '@lion/input';
import { LionButton } from '@lion/button';

import { WordCloudCanvas } from './canvas/WorldCloudCanvas.js';

export class WordCloud extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'lion-input': LionInput,
      'lion-button': LionButton,
      'word-cloud-canvas': WordCloudCanvas
    }
  }

  static get properties() {
    return {
      words: { type: Array }
    }
  }

  static get styles() {
    return css`
      :host {
        width: 100vw;
        height: 100vh;
      }

      word-cloud-canvas {
        height: 500px;
      }
    `;
  }

  constructor() {
    super();

    this.words = [];
  }

  addWord() {
    const input = this.shadowRoot.getElementById('input');
    this.words = [...this.words, input.modelValue];
    input.modelValue = '';
  }

  detectEnter(e) {
    if (e.key === 'Enter') {
      this.addWord();
    }
  }

  removeWord(e) {
    const newArray = [...this.words];
    if (e.detail < newArray.length) {
      newArray.splice(e.detail, 1);
    }

    this.words = newArray;
  }

  render() {
    return html`
      <word-cloud-canvas .words=${this.words} @removeWord=${this.removeWord}></word-cloud-canvas>
      <lion-input @keypress=${this.detectEnter} id='input' label="woord"></lion-input>
      <lion-button @click=${this.addWord}>Toevoegen</lion-button>
    `;
  }
}

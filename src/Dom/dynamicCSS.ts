import canUseDom from './canUseDom';

const MARK_KEY = `rc-util-key` as any;

interface Options {
  attachTo?: Element;
  csp?: { nonce?: string };
  prepend?: boolean;
}

function getContainer(option: Options) {
  if (option.attachTo) {
    return option.attachTo;
  }

  const head = document.querySelector('head');
  return head || document.body;
}

export function injectCSS(css: string, option: Options = {}) {
  if (!canUseDom()) {
    return null;
  }

  const styleNode = document.createElement('style');
  styleNode.nonce = option.csp?.nonce;
  styleNode.innerHTML = css;

  const container = getContainer(option);
  const { firstChild } = container;

  if (option.prepend && firstChild) {
    container.insertBefore(styleNode, firstChild);
  } else {
    container.appendChild(styleNode);
  }

  return styleNode;
}

export function updateCSS(css: string, key: string, option: Options = {}) {
  // Handle QianKun injection
  const measureNode = injectCSS('', option);
  const { parentElement } = measureNode;

  // Find exist style
  const existNode = [...parentElement.children].find(
    node => node.tagName === 'STYLE' && node[MARK_KEY] === key,
  );

  // Remove all
  if (existNode) {
    parentElement.removeChild(existNode);
  }
  parentElement.removeChild(measureNode);

  // Inject new one
  const newNode = injectCSS(css, option);
  newNode[MARK_KEY] = key;
  return newNode;
}

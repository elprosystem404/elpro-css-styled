const isBrowser = typeof document !== 'undefined';

// ......................................
////  create Style Element
// ......................................

const createElement = (cache, name) => {
  let node = document.createElement('style');
  node.setAttribute('data-e-style', `${cache.key} ${name}`);
  if (cache.nonce !== undefined) {
    node.setAttribute('nonce', cache.nonce);
  }
  document.head.appendChild(node);
  node.setAttribute('data-s', '');
  return node;
};

const insertRules = (sheet, cache, name) => {
  const node = createElement(cache, name);
  node.appendChild(document.createTextNode(sheet));
};

const styleSheet = (cache, name, styleSheets) => {
  styleSheets.map((sheet) => insertRules(sheet, cache, name));
};

// ......................................
////  create Style sheet
// ......................................

export const insertStyleSheet = (cache, styleSheets) => {
  if (isBrowser) {
    let arr = [];
    const ssrStyles = document.querySelectorAll(
      `style[data-e-style^="${cache.key} "]`
    );
    Array.prototype.forEach.call(ssrStyles, (node, i) => {
      const array = node.innerHTML.split(' ');
      const _name = array[0] ? array[0].trim() : array[0];
      arr.push(`${_name}`);
    });

    if (arr.includes(`.${styleSheets.name}`)) {
      return;
    }

    styleSheet(cache, styleSheets.name, styleSheets.styles);
  }
};

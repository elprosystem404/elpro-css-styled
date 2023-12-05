// ......................................
////  extract To Chunks
// ......................................

export const extractToChunks = (array, fn) => {
  let nameIndex = 0;
  let name = undefined;
  let open = [];
  let close = [];
  let closure = false;
  let indexArray = 0;

  array.forEach((element, index) => {
    if (!closure) {
      if (fn(element, index, array)) {
        nameIndex = index;
        name = element;
      }
      if (name) {
        if (element.includes('{')) {
          open.push(index);
        }
        if (element.includes('}')) {
          close.push(index);
        }
      }
      //--- closure class
      if (open.length > 0) {
        if (open.length === close.length) {
          closure = true;
          indexArray = index;
        }
      }
    }
  });
  open = open[0];
  close = close[close.length - 1];

  return {
    array,
    index: indexArray,
    name,
    nameIndex,
    open,
    close,
    props: [name],
    value: array.filter((_, index) => index > open && index < close),
    remaining: array.filter((_, index) => index < nameIndex || index > close),
  };
};

// ......................................
////  create Tokens
// ......................................

const createTokens = (array, indexArray = -1, result = [], cssArray) => {
  indexArray += 1;
  const [head, ...tail] = array;
  if (!head) {
    return result;
  }

  const next = tail[0] ? tail[0] : '';

  if (next.includes('{')) {
    const classname = head;
    const chunks = extractToChunks(
      array,
      (element, index, array) => element === classname
    );
    
    result = [...result, chunks];
    return createTokens(chunks.remaining, -1, result, cssArray);
  }
  return createTokens(tail, indexArray, result, cssArray);
};

// ......................................
////  tokenizer
// ......................................

export const tokenizer = (cssArray) => {
  let result = [];
  const tokens = createTokens(cssArray, -1, [], cssArray);

  return tokens;
};

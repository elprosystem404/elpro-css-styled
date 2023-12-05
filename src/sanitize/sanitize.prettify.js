import { regExp, removeDoubleSpace, removeSpace } from '../utils';

// ......................................
////  prettify Attributes
// ......................................

const attributePattern = /\(.*?\)|\[.*?\]/gm;

const replacementPrettifyAttrs = (match, p1, p2) => {
  if (match.includes('[')) {
    return removeSpace(match);
    //--- match.includes('(')
  } else {
    //--- hyphenated compound words  e.g. min-width:
    if (regExp.test(match, /[a-z]-[a-z]/gm)) {
      return removeSpace(match);
    }
    // no replace
    return match;
  }
};

/*--- prevents substitution in case of declaration value
   e.g. translate3d(0, 100, 0)  , calc(100% - 30px) 
   and in case of classes with attributes or atrules
   e.g. @media (min-width:760px)
   */
const prettifyAttributes = (str) => {
  return str.replaceAll(attributePattern, replacementPrettifyAttrs);
};


// ......................................
////  prettify Atrules
// ......................................

const replacementPrettifyAtrules = (match, p1, p2) => {
return removeSpace(match).replace('{', ' {')
}

const prettifyAtrules = (str) => {
  return str.replaceAll(/@.*?\{/gm, replacementPrettifyAtrules);
};

// ......................................
////  prettify
// ......................................

export const prettify = (str) => {
  const string = removeDoubleSpace(str)
    .replaceAll(' ;', ';')
    .replaceAll(' :', ':')
    .replaceAll(' (', '(')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
    .replaceAll(' [', '[')
    .replaceAll('[ ', '[')
    .replaceAll(' ]', ']')
    .replaceAll(/(;){1,}/gm, '; ')
    .replaceAll(/;\s{1,};/gm, '; ')
    .replaceAll('};', '}');

  const attrPrettified = prettifyAttributes(string);
  const atrulesPrettified =prettifyAtrules(attrPrettified)   
  return removeDoubleSpace(atrulesPrettified).trim();
};

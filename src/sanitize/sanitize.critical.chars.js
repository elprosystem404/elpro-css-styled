
import { removeDoubleSpace, removeLineBreak } from "../utils";

// ......................................
////  critical Decl Char
// ......................................

/*--- prevents replacing class names with colons
      e.g. &.classname p:not(.classic)
*/
const preventClassnameColons = (str) => {
    const index = str.indexOf('{');
    const noReplaceable = str.substring(0, index);
    const replaceable = str.substring(index);
    return `${noReplaceable}${replaceable
      .replaceAll(':', ':  ')
      .replaceAll(';', ';  ')}`;
  };
  
  const replacementCriticalDecl = (match, p1, p2, p3) => {
    if (match.includes('{')) {
      return preventClassnameColons(match);
    }
    return match.replaceAll(':', ':  ').replaceAll(';', ';  ');
  };
  
  // ......................................
  ////  critical Class Char
  // ......................................
  
  const criticalDeclChar = (str) => {
    return str.replaceAll(/[a-z\-\s]+:.*?;/gm, replacementCriticalDecl);
  };
  
  // ......................................
  ////  critical Class Char
  // ......................................
  
  const criticalClassChar = (str) => {
    return str
      .replaceAll(/\{|\}/g, ' $& ')
      .replaceAll('&', '  &');
  };
  
  // ......................................
  ////  sanitize Critical Chars
  // ......................................
  
  export const sanitizeCriticalChars = (str) => {
    const string = removeDoubleSpace(
      removeLineBreak(str).trim()
    );
  
    return criticalDeclChar(criticalClassChar(string));
  };
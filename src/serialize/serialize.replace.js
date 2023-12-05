import { partition, regExp, removeDoubleSpace } from '../utils';


// ......................................
////    Mult Slectors
// ......................................

const multSlectors = (props) => {
  // console.log({props});
  const [classnameRoot, nameRoot, ...ignore] = props;
  //--- multiSelectors
  if (nameRoot.includes(',')) {
    const split = nameRoot.split(',');
    const [h, ...t] = split;
    const replaceH = h.includes('&')
      ? `${h.replaceAll('&', classnameRoot)}`
      : `${classnameRoot} ${h}`;

    const replaceT = t.map((m) =>
      m.includes('&')
        ? `, ${m.replaceAll('&', classnameRoot)}`
        : `, ${classnameRoot} ${m}`
    );
    const multiSelectors = removeDoubleSpace(
      `${replaceH}${replaceT.join(' ')}`
    ).trim();

    return multiSelectors;
  }
};

// ......................................
////   replace Props Mult Slectors
// ......................................

const replacePropsMultSlectors = (props) => {
  const [propsRoot, propsMult] = partition(
    props,
    (elel, indx) => !elel.includes(',')
  );
  const propsRootReplaced = replaceProps.sigleSelectors(propsRoot).join(' ');

  const propsMultReplaced = [multSlectors([propsRootReplaced, ...propsMult])];

  return [propsRootReplaced, propsMultReplaced];
};

// ......................................
////   replace Props
// ......................................

let count = 0;
const sigleSelectors = (props, result = '') => {
  count += 1;
  if (props.length === 1) {
    return props;
  }

  const [a, b, ...tail] = props;

  if (count === 20 || !a || !b) {
    return [result];
  }

  const replace = b.includes('&') ? b.replaceAll('&', a) : `${a} ${b}`;

  return sigleSelectors([replace, ...tail], replace);
};

// ......................................
////   replace Props
// ......................................

const replaceSigleSelectors = (props) => {
  return sigleSelectors(props);
};

export const replaceProps = {
  sigleSelectors: (props) => replaceSigleSelectors(props),
  multSlectors: (props) => replacePropsMultSlectors(props),
};

// ......................................
////   replaceName
// ......................................

export const replaceName = (name, classname) => {
  const ampersandName = Array.isArray(classname)
    ? classname.join(' ')
    : classname;
  if (name.includes('&:')) {
    return `${ampersandName.replaceAll('&', '')}${name.replace(
      '&',
      ''
    )}`.trim();
  }
  return name.replaceAll('&', '').trim();
};

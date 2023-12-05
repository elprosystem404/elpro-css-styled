import {
  labelPattern,
  ownValue,
  ownkey,
  removeDoubleSpace,
  removeLabel,
} from '../utils';

// ......................................
////  utils
// ......................................

const getNameByLabel = (str) => {
  const label = str.match(labelPattern) || [];

  const nameLabel = label
    .join(' ')
    .split(' ')[1]
    .replace('.', '')
    .replace(';', '')
    .trim();

  return nameLabel.trim();
};

// ......................................
////  create Render Styles
// ......................................


 export const createRenderStyles = (inserted, cachekey) => {
  if (inserted && inserted && Array.isArray(inserted)) {
    let _key = '';
    let _ids = new Set();
    let _css = '';

    const styles = inserted.reduce((acc, prev) => {
      const { name, styles } = prev;
      const key = name.includes('css-') ? 'css' : cachekey;
      const classname = ownkey(styles);
      const value = ownValue(styles);
      const nameLabel = getNameByLabel(value);
      const nameIds = name.includes('@') ? [nameLabel, name] : [nameLabel];
      const css = `${
        classname.includes('@')
          ? classname
          : classname.startsWith('.')
          ? classname
          : `.${classname}`
      } { ${removeLabel(value)} }`;

      return [
        ...acc,
        {
          key: key,
          ids: nameIds,
          css: removeDoubleSpace(css),
        },
      ];
      
      // //--- single style tag like all css
      // const ids = name.split(' ')[0];
      // _key = key;
      // _ids.add(ids);
      // _css += ` ${css}`;

    }, []);

    return {
      styles,
      // //--- single style tag like all css
      //   styles: [
      //     {
      //       key: _key,
      //       ids: [..._ids],
      //       css: _css.trim(),
      //     },
      //   ],
    };
  }
  return {
    styles: [],
  };
};

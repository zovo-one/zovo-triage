class TypeRegistry {
  constructor() {
    let initial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.registeredTypes = initial;
  }
  get(type) {
    if (typeof this.registeredTypes[type] !== 'undefined') {
      return this.registeredTypes[type];
    } else {
      return this.registeredTypes.default;
    }
  }
  register(type, item) {
    if (typeof this.registeredTypes[type] === 'undefined') {
      this.registeredTypes[type] = item;
    }
  }
  registerDefault(item) {
    this.register('default', item);
  }
}
class KeyExtractors extends TypeRegistry {
  constructor(options) {
    super(options);
    this.registerDefault(el => el.getAttribute('name') || '');
  }
}
class InputReaders extends TypeRegistry {
  constructor(options) {
    super(options);
    this.registerDefault(el => el.value);
    this.register('checkbox', el => el.getAttribute('value') !== null ? el.checked ? el.getAttribute('value') : null : el.checked);
    this.register('select', el => getSelectValue(el));
  }
}
function getSelectValue(elem) {
  let value, option, i;
  const options = elem.options;
  const index = elem.selectedIndex;
  const one = elem.type === 'select-one';
  const values = one ? null : [];
  const max = one ? index + 1 : options.length;
  if (index < 0) {
    i = max;
  } else {
    i = one ? index : 0;
  }
  for (; i < max; i++) {
    option = options[i];
    if ((option.selected || i === index) &&
    !option.disabled && !(option.parentNode.disabled && option.parentNode.tagName.toLowerCase() === 'optgroup')) {
      value = option.value;
      if (one) {
        return value;
      }
      values.push(value);
    }
  }
  return values;
}
class KeyAssignmentValidators extends TypeRegistry {
  constructor(options) {
    super(options);
    this.registerDefault(() => true);
    this.register('radio', el => el.checked);
  }
}
function keySplitter(key) {
  const matches = key.match(/[^[\]]+/g);
  let lastKey;
  if (key.length > 1 && key.indexOf('[]') === key.length - 2) {
    lastKey = matches.pop();
    matches.push([lastKey]);
  }
  return matches;
}
function getElementType(el) {
  let typeAttr;
  const tagName = el.tagName;
  let type = tagName;
  if (tagName.toLowerCase() === 'input') {
    typeAttr = el.getAttribute('type');
    if (typeAttr) {
      type = typeAttr;
    } else {
      type = 'text';
    }
  }
  return type.toLowerCase();
}
function getInputElements(element, options) {
  return Array.prototype.filter.call(element.querySelectorAll('input,select,textarea'), el => {
    if (el.tagName.toLowerCase() === 'input' && (el.type === 'submit' || el.type === 'reset')) {
      return false;
    }
    const myType = getElementType(el);
    const extractor = options.keyExtractors.get(myType);
    const identifier = extractor(el);
    const foundInInclude = (options.include || []).indexOf(identifier) !== -1;
    const foundInExclude = (options.exclude || []).indexOf(identifier) !== -1;
    let foundInIgnored = false;
    let reject = false;
    if (options.ignoredTypes) {
      for (const selector of options.ignoredTypes) {
        if (el.matches(selector)) {
          foundInIgnored = true;
        }
      }
    }
    if (foundInInclude) {
      reject = false;
    } else {
      if (options.include) {
        reject = true;
      } else {
        reject = foundInExclude || foundInIgnored;
      }
    }
    return !reject;
  });
}
const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];
function assignKeyValue(obj, keychain, value) {
  if (!keychain) {
    return obj;
  }
  const key = keychain.shift();
  if (UNSAFE_KEYS.indexOf(key) !== -1) {
    return obj;
  }
  if (!obj[key]) {
    obj[key] = Array.isArray(key) ? [] : {};
  }
  if (keychain.length === 0) {
    if (!Array.isArray(obj[key])) {
      obj[key] = value;
    } else if (value !== null) {
      obj[key].push(value);
    }
  }
  if (keychain.length > 0) {
    assignKeyValue(obj[key], keychain, value);
  }
  return obj;
}
function serialize(element) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let data = {};
  options.keySplitter = options.keySplitter || keySplitter;
  options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
  options.inputReaders = new InputReaders(options.inputReaders || {});
  options.keyAssignmentValidators = new KeyAssignmentValidators(options.keyAssignmentValidators || {});
  Array.prototype.forEach.call(getInputElements(element, options), el => {
    const type = getElementType(el);
    const keyExtractor = options.keyExtractors.get(type);
    const key = keyExtractor(el);
    const inputReader = options.inputReaders.get(type);
    const value = inputReader(el);
    const validKeyAssignment = options.keyAssignmentValidators.get(type);
    if (validKeyAssignment(el, key, value)) {
      const keychain = options.keySplitter(key);
      data = assignKeyValue(data, keychain, value);
    }
  });
  return data;
}
class InputWriters extends TypeRegistry {
  constructor(options) {
    super(options);
    this.registerDefault((el, value) => {
      el.value = value;
    });
    this.register('checkbox', (el, value) => {
      if (value === null) {
        el.indeterminate = true;
      } else {
        el.checked = Array.isArray(value) ? value.indexOf(el.value) !== -1 : value;
      }
    });
    this.register('radio', function (el, value) {
      if (value !== undefined) {
        el.checked = el.value === value.toString();
      }
    });
    this.register('select', setSelectValue);
  }
}
function makeArray(arr) {
  const ret = [];
  if (arr !== null) {
    if (Array.isArray(arr)) {
      ret.push.apply(ret, arr);
    } else {
      ret.push(arr);
    }
  }
  return ret;
}
function setSelectValue(elem, value) {
  let optionSet, option;
  const options = elem.options;
  const values = makeArray(value);
  let i = options.length;
  while (i--) {
    option = options[i];
    if (values.indexOf(option.value) > -1) {
      option.setAttribute('selected', true);
      optionSet = true;
    }
  }
  if (!optionSet) {
    elem.selectedIndex = -1;
  }
}
function keyJoiner(parentKey, childKey) {
  return parentKey + '[' + childKey + ']';
}
function flattenData(data, parentKey) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const flatData = {};
  const keyJoiner$1 = options.keyJoiner || keyJoiner;
  for (let keyName in data) {
    if (!Object.prototype.hasOwnProperty.call(data, keyName)) {
      continue;
    }
    const value = data[keyName];
    let hash = {};
    if (parentKey) {
      keyName = keyJoiner$1(parentKey, keyName);
    }
    if (Array.isArray(value)) {
      hash[keyName + '[]'] = value;
      hash[keyName] = value;
    } else if (typeof value === 'object') {
      hash = flattenData(value, keyName, options);
    } else {
      hash[keyName] = value;
    }
    Object.assign(flatData, hash);
  }
  return flatData;
}
function deserialize(form, data) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const flattenedData = flattenData(data, null, options);
  options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
  options.inputWriters = new InputWriters(options.inputWriters || {});
  Array.prototype.forEach.call(getInputElements(form, options), el => {
    const type = getElementType(el);
    const keyExtractor = options.keyExtractors.get(type);
    const key = keyExtractor(el);
    const inputWriter = options.inputWriters.get(type);
    const value = flattenedData[key];
    inputWriter(el, value);
  });
}

export { deserialize, serialize };

import tv4 from 'tv4';

import FormUtil from './FormUtil';
import Util from './Util';

function filteredPaths(combinedPath) {
  return combinedPath.split('/').filter(function (path) {
    return path.length > 0;
  });
}

function getErroredFieldPositions(definition) {
  let fieldsWithError = [];

  definition.forEach(function (rowDefinition, indexInForm) {
    if (Array.isArray(rowDefinition)) {
      rowDefinition.forEach(function (columnDefinition, indexInRow) {
        let hasError = !!columnDefinition.showError;

        if (hasError) {
          fieldsWithError.push({
            indexInForm,
            indexInRow,
            showError: columnDefinition.showError
          });
        }
      });
    }
  });

  return fieldsWithError;
}

function setDefinitionValue(thingToSet, definition, renderRemove, model) {
  let {path, value} = thingToSet;
  let definitionToSet = SchemaFormUtil.getDefinitionFromPath(definition, path);

  if (Array.isArray(value) && value.length !== 0) {
    let prop = path[path.length - 1];

    let firstIndex = 0;
    definitionToSet.definition.find(function (field, i) {
      if (FormUtil.isFieldInstanceOfProp(prop, field)) {
        firstIndex = i;
        return true;
      }

      return false;
    });

    let indexesToError = getErroredFieldPositions(definitionToSet.definition);

    FormUtil.removePropID(definitionToSet.definition, prop);

    value.forEach(function (item, index) {
      // Use index for key, so we can re-use same key for same field,
      // to not make react think it is a completely new field
      let propID = Util.uniqueID(prop);
      let instanceDefinition = FormUtil.getMultipleFieldDefinition(
        prop,
        propID,
        definitionToSet.definition.itemShapes[prop].definition,
        item,
        index
      );

      if (definitionToSet.definition.itemShapes[prop].filterProperties) {
        definitionToSet.definition.itemShapes[prop]
          .filterProperties(item, instanceDefinition, model);
      }

      let arrayAction = 'push';
      if (definitionToSet.definition.itemShapes[prop].deleteButtonTop) {
        arrayAction = 'unshift';
      }

      let title = null;
      if (definitionToSet.definition.itemShapes[prop].getTitle) {
        title = definitionToSet.definition.itemShapes[prop].getTitle(index + 1);
      }
      instanceDefinition[arrayAction](
        renderRemove(definitionToSet.definition, prop, propID, title)
      );
      definitionToSet.definition.splice(firstIndex++, 0, instanceDefinition);
    });

    indexesToError.forEach(function (indexToError) {
      let needsToError = definitionToSet.definition[indexToError.indexInForm];
      if (needsToError) {
        needsToError = needsToError[indexToError.indexInRow];
        if (needsToError) {
          needsToError.showError = indexToError.showError;
        }
      }
    });
  }

  definitionToSet.value = value;
  definitionToSet.startValue = value;

  if (definitionToSet.filterProperties) {
    definitionToSet.filterProperties(value, definitionToSet, model);
  }
}

function getThingsToSet(model, path) {
  path = path || [];
  let thingsToSet = [];

  if (Array.isArray(model)) {
    thingsToSet.push({
      path,
      value: model
    });

    return thingsToSet;
  }

  Object.keys(model).forEach(function (key) {
    let pathCopy = path.concat([key]);
    let value = model[key];

    if (typeof value === 'object' && value !== null) {
      thingsToSet = thingsToSet.concat(getThingsToSet(value, pathCopy));
    } else {
      thingsToSet.push({
        path: pathCopy,
        value
      });
    }
  });

  return thingsToSet;
}

function processValue(value, valueType) {
  if (valueType === 'integer' || valueType === 'number') {
    if (value !== null && value !== '') {
      let parsedNumber = Number(value);
      if (isNaN(parsedNumber)) {
        return value;
      }

      return parsedNumber;
    }
  }

  if (valueType === 'array' && !value) {
    return [];
  }

  if (valueType === 'array' && typeof value === 'string') {
    return value.split(',')
      .map(function (val) { return val.trim(); })
      .filter(function (val) { return val !== ''; });
  }

  if (valueType === 'boolean' && value == null) {
    return false;
  }

  // Since values might be converted to null or empty strings
  // when processing values, let's make this test last,
  // i.e. after valueType checks
  if (value == null || value === '') {
    return null;
  }

  return value;
}

let SchemaFormUtil = {
  /**
   * Finds a specific field definition when a path is passed in.
   *
   * @param {Object} definition Definition to traverse to find the field definition.
   * @param {Array} paths Array of the properties needed to lookup to get to
   * definition.
   *
   * @return {Object} definition The definition that was found, or the
   * definition before the dead end.
   */
  getDefinitionFromPath(definition, paths) {
    if (definition[paths[0]]) {
      definition = definition[paths[0]];
      paths = paths.slice(1);
    }

    paths.forEach(function (path) {
      if (definition.definition == null) {
        return;
      }

      let nextDefinition = Array.prototype
        .concat.apply([], definition.definition).find(
          function (definitionField) {
            return definitionField.name === path
              || definitionField.title === path;
          }
        );

      if (nextDefinition) {
        definition = nextDefinition;
      }
    });

    return definition;
  },

  /**
   * Converts a model to a model that conforms to form properties.
   * For example, {cpu: '10'} will be converted to {cpu: 10} if the field 'cpu'
   * requires a number. This also transforms duplicable props like
   * 'ports[0].key' and 'ports[0].value' into the correct format.
   *
   * @param {Object} model Model to process.
   * @param {Object} multipleDefinition Definition to look at to enforce value
   * types.
   * @param {Array} prevPath (This argument is for internal recursive use.)
   * The paths taken to get to this model. Needed in order to find the
   * definition paths taken for each field.
   *
   * @return {Object} model Model that is created from definition.
   */
  processFormModel(model, multipleDefinition, prevPath = []) {
    let newModel = {};

    Object.keys(model).forEach(function (key) {
      let value = model[key];
      let path = prevPath.concat([key]);

      // Nested model.
      if (typeof value === 'object' && value !== null) {
        newModel[key] = SchemaFormUtil.processFormModel(
          value, multipleDefinition, path
        );
        return;
      }

      let definition = SchemaFormUtil.getDefinitionFromPath(
        multipleDefinition, path
      );
      if (definition == null) {
        return;
      }

      let {isRequired, valueType} = definition;
      let processedValue = processValue(value, valueType);
      if (processedValue != null || isRequired) {
        newModel[key] = processedValue;
      }
    });

    return FormUtil.modelToCombinedProps(newModel);
  },

  /**
   * Merges a model into a form definition. It puts all of the values in the
   * field definition's 'value' property.
   *
   * @param {Object} model Model to merge into definition.
   * @param {Object} definition Definition to receive values from model.
   * @param {Array} renderRemove Function to call to render a remove button.
   * This is necessary because the model might have multiple values, and if we
   * create more field definitions, we need to render a remove button after it.
   */
  mergeModelIntoDefinition(model, definition, renderRemove) {
    let thingsToSet = getThingsToSet(model);

    thingsToSet.forEach(function (thingToSet) {
      setDefinitionValue(
        thingToSet, definition, renderRemove, model
      );
    });
  },

  /**
   * Parses the error that comes back from tv4 in order for it to be easily
   * consumable.
   *
   * @param {Object} tv4Error The error that comes from tv4 to parse.
   *
   * @return {Object} errorObj An error object. 'message' is the error message.
   * 'path' is the path towards the value in the model.
   */
  parseTV4Error(tv4Error) {
    let errorObj = {
      message: tv4Error.message,
      path: filteredPaths(tv4Error.dataPath)
    };

    let schemaPath = tv4Error.schemaPath.split('/');

    if (tv4Error.code === 302) {
      errorObj.path.push(tv4Error.params.key);
    }

    if (schemaPath[schemaPath.length - 2] === 'items') {
      errorObj.path.pop();
    }

    return errorObj;
  },

  /**
   * Validates the model against a schema. For example, it'll check if it's the
   * correct shape, and that the value types are the same as stated in the
   * schema.
   *
   * @param {Object} model The model to validate.
   * @param {Object} schema The schema for the model to validate against.
   *
   * @return {Array} errorObjs Array of error objects. Each object consists of
   * the properties 'message' and 'path'.
   */
  validateModelWithSchema(model, schema) {
    let result = tv4.validateMultiple(model, schema);

    if (result == null || result.valid) {
      return [];
    }

    return result.errors.map(function (error) {
      return SchemaFormUtil.parseTV4Error(error);
    });
  }
};

module.exports = SchemaFormUtil;

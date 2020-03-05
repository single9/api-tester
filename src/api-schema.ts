import {
  ICallableApiFunction,
  ICApiSchema,
  IApiSchemaOptions,
  IActionParams,
} from './interfaces';
import Action from './action';

export class ApiSchema {
  [key: string]: ICallableApiFunction;
  constructor(schemas: ICApiSchema[], opts?: IApiSchemaOptions) {
    const rootUrl = opts && opts.rootUrl;

    if (!rootUrl) throw new Error('rootUrl must be specified');

    const action = new Action(opts);
    schemas.forEach(schema => {
      if (schema.name.search(/\W+/) >= 0)
        throw new Error('name only allow certain words and digits');
      if (this[schema.name] !== undefined)
        throw new Error(`Duplicated API: ${schema.name}`);
      this[schema.name] = actions(action, rootUrl, schema);
    });
  }
}

function actions(action: Action, rootUrl: string, data: ICApiSchema) {
  return async (params: IActionParams) => {
    let _data = Object.assign({}, data);
    let qs = '';
    let _path = _data.path;

    if (_data.queryString) {
      qs = parseQueryStringParams(_data.queryString);
    }

    if (_data.pathParams) {
      _path = parsePathParams(_path, _data.pathParams);
    }

    if (params) {
      if (params.queryString) {
        qs = parseQueryStringParams(params.queryString);
      }

      if (params.pathParams) {
        _path = parsePathParams(_path, params.pathParams);
      }

      if (params.body) {
        _data.body = params.body;
      }

      if (params.uploads) {
        _data.uploads = params.uploads;
      }
    }

    if (_path.search(/:.*/) > 0) {
      throw new Error('some parameter not initailized: ' + _path );
    }

    _data.path = rootUrl + _path + (qs && ('?' + qs));

    let act = action[_data.method.toLowerCase()](_data, params);

    act.then((resp: any) => {
      if (params && typeof(params.tester) === 'function') {
        try {
          params.tester(resp.toJSON().body);
        } catch (err) {
          console.error(err.stack);
        }
      }
    })
    .catch(console.error);

    return act;
  };
}

function parseQueryStringParams(queryString: IActionParams['queryString']) {
  let qs = [];

  if (Array.isArray(queryString)) {
    queryString.forEach(elem => {
      qs.push(elem.name + '=' + elem.value);
    });
  } else {
    for (let key in queryString) {
      qs.push(key + '=' + queryString[key]);
    }
  }

  return qs.join('&');
}

function parsePathParams(path: string, pathParams: IActionParams['pathParams']) {
  let _path = path;

  if (Array.isArray(pathParams)) {
    pathParams.forEach(elem => {
      if (elem.value) {
        _path = _path.replace(':' + elem.name, elem.value.toString());
      } else {
        throw new Error('pathParams is invalid');
      }
    });
  } else {
    for (let key in pathParams) {
      _path = _path.replace(':' + key, pathParams[key].toString());
    }
  }

  return _path;
}

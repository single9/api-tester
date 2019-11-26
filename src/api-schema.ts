import fs from 'fs';
import path from 'path';
import request from 'request';
import mime from 'mime-types';

type HTTPMethod = 'get' | 'post' | 'delete' | 'put' | 'patch';
type ApiParamObj = {
  [key: string]: string | number;
} 

type ApiParamArray = {
  name: string;
  value: string | number;
}[]

export interface ICApiUploadFile {
  fieldName: string;
  filename: string;
  path: string;
  contentType?: string;
}


export interface ICApiSchema {
  name: string;
  path: string;
  queryString?: IActionParams['queryString'];
  method: HTTPMethod;
  body?: IActionParams['body'];
  pathParams?: IActionParams['pathParams'];
  uploads?: ICApiUploadFile[];
  encoding?: string | null;
}

export interface IApiSchemaOptions {
  rootUrl?: string;
  showResult?: boolean;
}

export interface ICallableApiFunction {
  (param: IActionParams): Promise<request.ResponseAsJSON>
}

export interface IActionTesterFunction {
  (result: any): void;
}
export interface IActionParams {
  queryString?: ApiParamObj | ApiParamArray;
  pathParams?: ApiParamObj | ApiParamArray;
  body?: {
    [key: string]: any
  }
  uploads?: ICApiUploadFile[];
  tester?: IActionTesterFunction;
}

export class ApiSchema {
  [key: string]: any;
  private rootUrl: string = 'http://localhost:3000';
  private isShowResult: boolean = false;
  private apis: {
    [key: string]: ICallableApiFunction
  } = {};
  constructor(schemas: ICApiSchema[], opts?: IApiSchemaOptions) {
    if (opts) {
      if (opts.rootUrl) {
        this.rootUrl = opts.rootUrl;
      }

      if (opts.showResult) {
        this.isShowResult = opts.showResult;
      }
    }

    this.genApiFunction(schemas);
  }

  get Apis() {
    return this.apis;
  }

  private genApiFunction(schemas: ICApiSchema[]) {
    schemas.forEach(schema => {
      if (schema.name.search(/\W+/) >= 0)
        throw new Error('name only allow certain words and digits');
      if (this.apis[schema.name] !== undefined) 
        throw new Error(`Duplicated API: ${schema.name}`);
      this.apis[schema.name] = this.actions(schema);
    });
  }

  private actions(data: ICApiSchema) {
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

      _data.path = this.rootUrl + _path + (qs && ('?' + qs));

      let action = this[_data.method.toLowerCase()](_data, params);

      action.then((resp: any) => {
        if (params && typeof(params.tester) === 'function') {
          console.log('-= Tester =-');
          try {
            params.tester(resp.toJSON().body);
            console.log('All test done.');
          } catch (err) {
            console.error(err.stack);
          }
          console.log('-----');
        }
      })
      .catch(console.error);

      return action;
    };
  }

  private get(data: ICApiSchema) {
    return new Promise((resolve, reject) => {
      request.get(data.path, {
        time: true,
        json: true,
      }, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  private delete(data: ICApiSchema) {
    return new Promise((resolve, reject) => {
      request.delete(data.path, {
        time: true,
        json: true,
        body: data.body,
      }, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  private post(data: ICApiSchema) {
    return new Promise((resolve, reject) => {
      let sendData: {
        [key: string]: any
       } = {
        encoding: data.encoding,
        time: true,
        json: true,
      };

      let form: {
        [key: string]: any
       } = {};

      if (data.uploads) {
        data.uploads.forEach(file => {
          let _files = [];

          if (Array.isArray(file.path)) {
            let _file = fs.createReadStream(file.path);
            _files.push(_file);
          }

          if (_files.length > 0) {
            form[file.fieldName] = _files;
          } else {
            form[file.fieldName] = fs.createReadStream(file.path);
          }
        });

        if (data.body) {
          let body = data.body;
          let keys = Object.keys(body);
          keys.forEach(key => {
            form[key] = body[key].toString();
          });
        }
      }

      if (Object.keys(form).length > 0) {
        sendData.formData = form;
      } else if (data.body) {
        sendData.body = data.body;
      }

      request.post(data.path, sendData, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }
  
  private put(data: ICApiSchema) {
    return new Promise((resolve, reject) => {
      request.put(data.path, {
        time: true,
        json: true,
        body: data.body,
      }, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  private patch(data: ICApiSchema) {
    return new Promise((resolve, reject) => {
      request.patch(data.path, {
        time: true,
        json: true,
        body: data.body,
      }, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  private showResult(res: request.Response) {
    if (this.isShowResult === false) return;
    let response = res.toJSON();
    console.log(
      '-= Request =-\n',
      response.request.method, response.request.uri.href,
      '\n----------- Responses ------------\n',
      'Status Code: ' + response.statusCode + '\n',
      'Body: \n' + JSON.stringify(response.body),
      '\n--------------',
      res.elapsedTime, 'ms -------------'
    );
  }
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

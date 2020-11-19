import fs from 'fs';
import request from 'request';
import {
  ICApiSchema,
  IApiSchemaOptions,
} from './interfaces';

function getOptions(data: ICApiSchema) {
  return Object.assign({
    time: true,
    json: true,
  }, data);
}

export default class {
  [key: string]: Promise<request.Response> | any;
  private isShowResult: boolean;
  constructor(opts?: IApiSchemaOptions) {
    this.isShowResult = opts && opts.showResult || false;
  }

  get(data: ICApiSchema): Promise<request.Response> {
    const options = getOptions(data);
    return new Promise((resolve, reject) => {
      request.get(data.path, options, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  delete(data: ICApiSchema): Promise<request.Response> {
    const options = getOptions(data);
    return new Promise((resolve, reject) => {
      request.delete(data.path, options, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  post(data: ICApiSchema): Promise<request.Response> {
    const options = getOptions(data);
    return new Promise((resolve, reject) => {
      let sendData: {
        [key: string]: any
       } = options;

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
  
  put(data: ICApiSchema): Promise<request.Response> {
    const options = getOptions(data);
    return new Promise((resolve, reject) => {
      request.put(data.path, options, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          this.showResult(resp);
          resolve(resp);
        }
      });
    });
  }

  patch(data: ICApiSchema): Promise<request.Response> {
    const options = getOptions(data);
    return new Promise((resolve, reject) => {
      request.patch(data.path, options, (err, resp) => {
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

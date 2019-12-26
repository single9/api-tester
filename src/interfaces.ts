import request from 'request';

type HTTPMethod = 'get' | 'post' | 'delete' | 'put' | 'patch';
type ApiParamObj = {
  [key: string]: string | number;
}

type ApiParamArray = {
  name: string;
  value: string | number;
}[];

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

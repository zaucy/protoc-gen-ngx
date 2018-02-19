import { grpc, Code, Metadata } from "grpc-web-client";

export type _protocGenNgxBaseServiceRequestInterceptor = (method:any, request:any) => Promise<any>;

export type _protocGenNgxBaseServiceMessageInterceptor = () => Promise<any>;

export interface _protocGenNgxBaseServiceHandleInvokeResponse {

}

export interface _protocGenNgxBaseServiceEnd {
  code: Code;
  msg: string|undefined;
  metadata: Metadata;
}

export interface _protocGenNgxBaseServiceInterceptor<MessageT> {
  onMessage(message: MessageT);
  onError(data: _protocGenNgxBaseServiceEnd);
  onDone(data: _protocGenNgxBaseServiceEnd);
}

export class _protocGenNgxBaseService {
  
  private _requestInterceptors: Array<_protocGenNgxBaseServiceRequestInterceptor> = [];
  private _messageInterceptors: Array<_protocGenNgxBaseServiceMessageInterceptor> = [];

  protected async _handleInvoke<RequestT, ResponseT>
    ( method: any
    , request: RequestT
    , callbacks: {error: any, next: any, done: any}
    , inputClass: any
    , outputClass: any
    ): Promise<ResponseT>
  {
    let result:any = null;

    for(const reqInterceptor of this._requestInterceptors) {
      result = await reqInterceptor(method, request).catch(err => err);

      if(result instanceof outputClass) {
        return result;
      }
    }

    if(!result) {
      return Promise.reject(new Error("No interceptor"));
    }

    return result;
  }
  
  public addInterceptor<MessageT>(interceptor: _protocGenNgxBaseServiceInterceptor<MessageT>) {

  }
  
  public interceptRequest(interceptorFn: _protocGenNgxBaseServiceRequestInterceptor): () => void {
    this._requestInterceptors.push(interceptorFn);
    
    return () => {
      let index = this._requestInterceptors.findIndex(v => v == interceptorFn);
      if(index > -1) {
        this._requestInterceptors.splice(index, 1);
        return true;
      }

      return false;
    };
  }

  public interceptMessage(interceptorFn: _protocGenNgxBaseServiceMessageInterceptor) {
    this._messageInterceptors.push(interceptorFn);
    
    return () => {
      let index = this._messageInterceptors.findIndex(v => v == interceptorFn);
      if(index > -1) {
        this._messageInterceptors.splice(index, 1);
        return true;
      }

      return false;
    };
  }
}

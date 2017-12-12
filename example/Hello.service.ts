import { Injectable, NgZone, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { grpc, Code, Metadata } from "grpc-web-client";

import { Hello as __service } from "./hello_pb_service";
import { HelloResponse } from "./helloresponse_pb";
import { HelloRequest } from "./hellorequest_pb";

@Injectable()
export class HelloService {

	ping(request: HelloRequest): Promise<HelloResponse> {

		let next, error, done = () => {}, ret = new Promise<HelloResponse>((rs, rj) => {next = rs; error = rj});

		grpc.invoke(<any> __service.service, <any> {
			request: request,
			onMessage: (response: HelloResponse) => {
				next(response);
			},
			onEnd: (code: Code, msg: undefined | string, metadata: Metadata) => {
				if(code != Code.OK) {
					error({code, msg, metadata});
				} else {
					done({code, msg, metadata});
				}
			}
		});

		return ret;
	}

	pingStream(request: HelloRequest): Observable<HelloResponse> {

		let next, error, done, ret = new Subject<HelloResponse>(); next = v => ret.next(v); error = e => ret.error(e); done = v => ret.complete(v);

		grpc.invoke(<any> __service.service, <any> {
			request: request,
			onMessage: (response: HelloResponse) => {
				next(response);
			},
			onEnd: (code: Code, msg: undefined | string, metadata: Metadata) => {
				if(code != Code.OK) {
					error({code, msg, metadata});
				} else {
					done({code, msg, metadata});
				}
			}
		});

		return ret;
	}

}

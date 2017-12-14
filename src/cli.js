#! /usr/bin/env node
const protocPlugin = require("protoc-plugin");
const mustache = require("mustache");
const path = require("path");
const fs = require("fs");

const NGX_SERVICE_TEMPLATE = path.resolve(__dirname, "ngx-service.ts.template");

protocPlugin((protos, opts) => {
	// do stuff here with protos
	// return array like [{name: 'filename', content: 'CONTENTS'}]

	const serviceTemplateSrc = fs.readFileSync(NGX_SERVICE_TEMPLATE, 'utf8');

	return protos.reduce((files, proto) => {

		let protoServiceImport = "./_grpc-gen_web_out/" +
			path.basename(proto.name, ".proto") + "_pb_service";
		let protoImport = "./_grpc-gen_web_out/" +
			path.basename(proto.name, ".proto") + "_pb";

		// console.log("protoImport:", protoImport);

		files = files.concat(proto.serviceList.map(service => {

			let serviceImportSymbol = service.name;
			// let serviceImportPath = "./" + service.name.toLowerCase() + "_pb_service";
			let serviceImportPath = protoServiceImport;
			let serviceMessageImports = {};


			service.methodList.forEach(method => {
				let outputType = method.outputType.substr(1);
				let inputType = method.inputType.substr(1);

				serviceMessageImports[outputType] = true;
				serviceMessageImports[inputType] = true;
			});

			serviceMessageImports = Object.keys(serviceMessageImports).map(symbol => {
				return {
					symbol: symbol,
					// path: "./" + symbol.toLowerCase() + "_pb",
					// path: protoImport,
					path: "./_grpc-gen_web_out/",
				}
			});

			return {
				name: service.name + '.service.ts',
				content: mustache.render(serviceTemplateSrc, {
					name: service.name,
					message_imports: serviceMessageImports,
					import_symbol: serviceImportSymbol,
					import_path: serviceImportPath,
					methods: service.methodList.map(method => {
						let outputType = method.outputType.substr(1);
						let inputType = method.inputType.substr(1);
						let methodDefinition = {
							name: method.name,
							inputType: method.clientStreaming ?
								`Observable<${inputType}>` :
								`${inputType}`,
							returnType: method.serverStreaming ?
								`Observable<${outputType}>` :
								`Promise<${outputType}>`,
							returnTypeCtor: method.serverStreaming ?
								`let next, error, done, ret = new Subject<${outputType}>(); next = v => ret.next(v); error = e => ret.error(e); done = v => ret.complete(v)` :
								`let next, error, done = v=>{}, ret = new Promise<${outputType}>((rs, rj) => {next = rs; error = rj})`,
							outputType: outputType,
							clientStreaming: method.clientStreaming,
							serverStreaming: method.serverStreaming,
						};

						// console.error(methodDefinition);

						return methodDefinition;
					})
				})
			};
		}));

		// files = files.concat(proto.messageTypeList.map(messageType => {
		// 	let messageFilename = messageType.name + '.ts';
		// 	return {
		// 		messageFilename
		// 	};
		// }));

		// console.error(files.map(file => file.name));

		return files;
	}, []);

	// console.error(protos[0].sourceCodeInfo.locationList.map(a => {
	// 	return a;
	// }));

	return [];
});

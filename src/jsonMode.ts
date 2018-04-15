/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {WorkerManager} from './workerManager';
import {JSONWorker} from './jsonWorker';
import {LanguageServiceDefaultsImpl} from './monaco.contribution';
import * as languageFeatures from './languageFeatures';
import {createTokenizationSupport} from './tokenization';

import Promise = monaco.Promise;
import Uri = monaco.Uri;

export function setupMode(defaults: LanguageServiceDefaultsImpl): void {

	const client = new WorkerManager(defaults);

	const worker: languageFeatures.WorkerAccessor = (...uris: Uri[]): Promise<JSONWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	let languageId = defaults.languageId;

	monaco.languages.registerCompletionItemProvider(languageId, new languageFeatures.CompletionAdapter(worker));
	monaco.languages.registerHoverProvider(languageId, new languageFeatures.HoverAdapter(worker));
	monaco.languages.registerDocumentSymbolProvider(languageId, new languageFeatures.DocumentSymbolAdapter(worker));
	monaco.languages.registerDocumentFormattingEditProvider(languageId, new languageFeatures.DocumentFormattingEditProvider(worker));
	monaco.languages.registerDocumentRangeFormattingEditProvider(languageId, new languageFeatures.DocumentRangeFormattingEditProvider(worker));
	new languageFeatures.DiagnostcsAdapter(languageId, worker);
	monaco.languages.setTokensProvider(languageId, createTokenizationSupport(true));
	monaco.languages.setLanguageConfiguration(languageId, richEditConfiguration);
}


const richEditConfiguration: monaco.languages.LanguageConfiguration = {
	wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,

	comments: {
		lineComment: '//',
		blockComment: ['/*', '*/']
	},

	brackets: [
		['{', '}'],
		['[', ']']
	],

	autoClosingPairs: [
		{ open: '{', close: '}', notIn: ['string'] },
		{ open: '[', close: ']', notIn: ['string'] },
		{ open: '"', close: '"', notIn: ['string'] }
	]
};


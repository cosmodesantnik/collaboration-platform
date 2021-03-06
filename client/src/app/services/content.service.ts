import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

//import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

import { User } from '../models/user.model';
import { Corpus } from '../models/corpus.model';
import { Text } from '../models/text.model';
import { SocketService } from './socket.service';

import * as arrayMove from 'array-move';
import { FormControl } from '@angular/forms';
import { Document } from '../models/document.model';
import { Concept } from '../models/concept.model';

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	/*****************************************************************************
	 *  VARIABLES
	 ****************************************************************************/
	private sub: Subscription;
	private corpusTitle: string = '';

	// To Change to :
	public conceptTitle: string = '';
	public editingDocumentIndex: number = 0;
	public editorCorpus: Corpus = null;

	public exploringCorpusIndex: number = 0;
	public exploringDocumentIndex: number = 0;
	public explorerConcept: Concept = null;

	public editorTexts: Text[] = [];

	// TO DELETE


	private user: User = new User();

	public corpus: Corpus = new Corpus();
	public explorerTexts: Text[] = [];
	public editorCommands: boolean = false;

	public useMockData: boolean = false;

	public editorDocument: Document = new Document();

	/*****************************************************************************
	 *  MAIN
	 ****************************************************************************/
	constructor(
		private socket: SocketService, 
		private us: UserService, 
	) {

		// Editor Error Message
		this.sub = this.socket.response('editor/error').subscribe(response => {
			if (response.success === false) console.log(response.message);
		});

		// Editor Corpus
		this.sub = this.socket.response('editor/corpus').subscribe(editorCorpus => {
			console.log(editorCorpus);
			this.editorCorpus = editorCorpus;
			console.log(this.editorCorpus)
		});

		// Editor Document
		this.sub = this.socket.response('editor/document').subscribe(([index, document]) => {
			this.editorCorpus.documents[index] = document;
		});

		// Explorer Concept
		this.sub = this.socket.response('explorer/concept').subscribe(explorerConcept => {
			console.log(explorerConcept);
			this.explorerConcept = explorerConcept;
			console.log(this.explorerConcept)
		});

		// Explorer Document
		this.sub = this.socket.response('explorer/document').subscribe(([corpusIndex, documentIndex, document]) => {
			console.log(corpusIndex);
			console.log(documentIndex);
			console.log(document);
			this.explorerConcept.corpora[corpusIndex].documents[documentIndex] = document;
			// console.log(explorerConcept);
			// this.explorerConcept = explorerConcept;
			// console.log(this.explorerConcept)
		});

		// if (this.useMockData) {
		// 	//this.setMockData();
		// } else {
		// 	// Set the corpus to the client
		// 	this.sub = this.activeRouter.params.subscribe(params => {
		// 		this.corpusTitle = params.title;

		// 		// Editor Error Message
		// 		this.sub = this.socket.response('editor/error').subscribe(response => {
		// 			if (response.success === false) console.log(response.message);
		// 		});

		// 		// Editor Document
		// 		this.sub = this.socket.response('editor/document').subscribe(document => {
		// 			this.editorDocument = document;
		// 			console.log(this.editorDocument)
		// 		});

		// 		// // Explorer Error Message
		// 		// this.sub = this.socket.response('explorer/error').subscribe(message => {
		// 		// 	console.log(message);
		// 		// });

		// 		// // Editor Texts
		// 		// this.sub = this.socket.response('editor/texts').subscribe(editorTexts => {
		// 		// 	console.log(editorTexts);
		// 		// 	this.editorTexts = Text.maps(editorTexts);
		// 		// });

		// 		// // Editor Texts - Create Text
		// 		// this.sub = this.socket.response('editor/create-text-response').subscribe(({ text, index }) => {
		// 		// 	this.editorTexts.splice(index, 0, Text.map(text));
		// 		// });

		// 		// // Editor Texts - Delete Text
		// 		// this.sub = this.socket.response('editor/delete-text-response').subscribe(index => {
		// 		// 	this.editorTexts.splice(index, 1);
		// 		// });

		// 		// // Editor Texts - Error while moving text
		// 		// this.sub = this.socket.response('editor/move-text-error').subscribe(({ from, to }) => {
		// 		// 	arrayMove.mutate(this.editorTexts, from, to);
		// 		// });

		// 		// // Explorer Texts
		// 		// this.sub = this.socket.response('explorer/texts').subscribe(explorerTexts => {
		// 		// 	console.log(explorerTexts);
		// 		// 	this.explorerTexts = Text.maps(explorerTexts);
		// 		// });

		// 		// // Explorer Texts - Error while moving text
		// 		// this.sub = this.socket.response('explorer/move-text-error').subscribe(({ from, to }) => {
		// 		// 	arrayMove.mutate(this.explorerTexts, from, to);
		// 		// });

		// 		// // Adopt explorer to editor
		// 		// this.sub = this.socket.response('explorer/adopt-text-error').subscribe(({ from, to }) => {
		// 		// 	const text = this.editorTexts[from];
		// 		// 	this.editorTexts.splice(from, 0);
		// 		// 	this.explorerTexts.splice(to, 0, text);
		// 		// });

		// 		// // Explorer Texts
		// 		// this.sub = this.socket.response('explorer/update').subscribe(explorerTexts => {
		// 		// 	this.socket.request('explorer/refresh-texts', {});
		// 		// });

		// 		//this.socket.request('editor/initialize', this.corpusTitle);
		// 		//this.socket.request('explorer/initialize', this.corpusTitle);
		// 	});
		// }
	}

	/*****************************************************************************
	 *  DISPLAY SETTINGS
	 ****************************************************************************/
	// Variables
	public selectedDisplayState: FormControl = new FormControl(0);
	public displayStates = [
		{value: 0, name: "Editor"},
		{value: 1, name: "Explorer"},
		{value: 2, name: "Split vertical"},
		{value: 3, name: "Split horizontal"},
	];

	public setDisplayState(state) {
		this.selectedDisplayState.setValue(state.value);
	}

	/*****************************************************************************
	 *  EDITOR SETTINGS
	 ****************************************************************************/
	// Variables
	public selectedEditorState: FormControl = new FormControl(0);
	public editorState = [
		{value: 0, name: "Overview", icon: "home"},
		{value: 1, name: "Edit", icon: "edit"},
		{value: 2, name: "History", icon: "menu_book"},
	];

	public setEditorState(state) {
		this.selectedEditorState.setValue(state.value);
	}

	public initializeEditor(title: string): void {
		if(title != this.corpusTitle) {
			this.corpusTitle = title;
			this.socket.request('editor/initialize', title);
		}
	}

	/*****************************************************************************
	 *  EXPLORER SETTINGS
	 ****************************************************************************/
	// Variables
	public selectedExplorerState: FormControl = new FormControl(0);
	public explorerState = [
		{value: 0, name: "Overview", icon: "home"},
		{value: 1, name: "Edit", icon: "edit"},
		{value: 2, name: "History", icon: "menu_book"},
	];

	public setExplorerState(state) {
		this.selectedExplorerState.setValue(state.value);
	}

	public initializeExplorer(title: string): void {
		if(title != this.corpusTitle) {
			this.corpusTitle = title;
			this.socket.request('explorer/initialize', title);
		}
	}

	/*****************************************************************************
	 *  WEB SOCKETS REQUEST
	 ****************************************************************************/

	public createTextAtIndex(index: number) {
		this.socket.request('editor/create-text-at-index', index);
	}

	public deleteTextAtIndex(index: number) {
		console.log(index);
		console.log(this.editorTexts);
		this.socket.request('editor/delete-text-at-index', index);
	}

	public saveEditorTexts() {
		this.socket.request(
			'editor/update-texts',
			this.editorTexts.map(text => {
				return text.text;
			}),
		);
	}

	public refreshEditorTexts() {
		this.socket.request('editor/refresh-texts', {});
	}

	public moveEditorText(from: number, to: number) {
		if (from === to) return;
		else this.socket.request('editor/move-text', { from, to });
	}

	public moveExplorerText(from: number, to: number) {
		if (from === to) return;
		else this.socket.request('explorer/move-text', { from, to });
	}

	public adoptExplorerText(from: number, to: number) {
		this.socket.request('explorer/adopt-text', { from, to });
	}

	public increasePointer(index: number, amount: number) {
		this.socket.request('editor/increase-pointer', { index, amount });
	}

	public hideCommands() {
		if (this.editorCommands === true) this.editorCommands = false;
		else this.editorCommands = true;
	}

	/*

  public createTextAtIndex(index: number) {
    this.socket.emit('create-text-at-index', {
      username: this.user.username, 
      title: this.corpusTitle,
      index: index
    });
  }

  public updateTextAtIndex(index: number) {
    this.socket.emit('update-text-at-index', {
      username: this.user.username, 
      title: this.corpusTitle,
      text: this.editorTexts[index].text,
      index: index
    });
  }

  public deleteTextAtIndex(index: number) {
    this.socket.emit('delete-text-at-index', {
      username: this.user.username, 
      title: this.corpusTitle,
      index: index
    });
  }




   public test() {
    this.socket.emit('create-text-at-index', {
      username: this.user.username, 
      title: this.corpusTitle,
      index: 0
    });
   }

   public getEditorText() {
    this.socket.emit('get-editor-text', {
      username: this.user.username, 
      title: this.corpusTitle
    });
   } 

   public getExplorerText() {
    this.socket.emit('get-explorer-text', {
      username: this.user.username, 
      title: this.corpusTitle
    });
   } 

   public saveEditorText() {
    this.socket.emit('createContent', {
      username: this.user.username, 
      title: this.corpusTitle,
      texts: [this.editorTexts],
    });
   }


  public getContent(username: string, title: string) {
    this.socket.emit('getContent', {username: username, title: title});
  }

  public createText(route: string) {
    console.log({username: this.us.currentUser.username, title: route});
    this.socket.emit('create-empty-text-by-username-and-title', {username: this.us.currentUser.username, title: route});
  }

  /*****************************************************************************
   *  MOCK DATA
   ****************************************************************************/

	/*
   private setMockData() {
    this.corpus = new Corpus(1,"corpus title", "this is the description");
    this.editorTexts = [
      new Text(1, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium sagittis tortor, a mattis ipsum varius quis. Nam at sem sit amet mauris cursus eleifend. Proin non felis a lorem venenatis facilisis. Phasellus a tellus sit amet lorem finibus aliquet. Vivamus sed mollis mauris. Integer ac nisl tincidunt, venenatis nisl at, malesuada urna. Sed non tempor purus. Curabitur sagittis diam magna, et varius risus finibus ut. Donec imperdiet sapien non diam vehicula, id placerat felis interdum. Sed scelerisque vel augue quis luctus. Nullam neque nibh, vulputate ut erat et, posuere rutrum massa. Praesent sit amet sollicitudin ante, vitae tristique quam. Maecenas nec diam libero. Suspendisse vitae est eleifend, congue sem non, auctor augue. Donec mollis finibus felis id placerat. Suspendisse potenti.", 0, 0, 0, 0, false),
      new Text(2, "Quisque vehicula tempus risus, a lobortis dui condimentum sit amet. Nam laoreet elementum nunc ut efficitur. Nunc gravida vestibulum rhoncus. Praesent vitae malesuada dui. Fusce a viverra diam, id fermentum velit. Proin consectetur odio arcu, non pretium turpis interdum et. Etiam ut suscipit dolor. Maecenas tristique sit amet sem in malesuada. Maecenas volutpat sem justo, eu interdum diam lacinia sed. Curabitur lobortis ac dui vitae ultricies. Duis varius justo augue, ac rhoncus ligula euismod in. Phasellus vitae malesuada lectus. Quisque nisl tellus, elementum ac turpis quis, tincidunt sodales nibh. Vivamus id lacus non nibh tristique fringilla ac non est. Praesent non metus nec velit vulputate sagittis.", 0, 0, 0, 0, false),
      new Text(3, "Sed libero sem, efficitur at dignissim eget, feugiat in leo. Integer vestibulum, odio imperdiet luctus tristique, augue velit consectetur justo, a mattis ex arcu ut ligula. Etiam porttitor sapien in augue gravida iaculis. Integer rutrum turpis tellus. Fusce magna nunc, vulputate sit amet ex nec, laoreet lacinia ante. In laoreet odio id nibh facilisis sodales. Integer purus leo, dapibus eu imperdiet nec, efficitur sed mauris. Nam lobortis scelerisque urna id sagittis. Quisque sagittis dolor sit amet risus vehicula tempor. Aenean vel condimentum massa. Sed purus diam, bibendum eu sem at, fringilla tristique sapien. Suspendisse nulla felis, ultrices sit amet magna at, porta convallis sapien. Cras non lorem suscipit, pretium velit nec, venenatis felis. Cras venenatis nisl id eros efficitur, et molestie augue ullamcorper. Suspendisse ornare, risus id interdum porta, tellus ipsum semper diam, quis mattis augue turpis in neque. Proin augue turpis, pulvinar a lorem eu, egestas faucibus turpis.", 0, 0, 0, 0, false),
      new Text(4, "fourth paragraph", 0, 0, 0, 0, false),
    ]
    this.explorerTexts = [
      new Text(1, "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis diam vitae massa pellentesque, a accumsan elit iaculis. Integer tincidunt in purus ac euismod. Sed ultrices suscipit nisi id consectetur. Vestibulum sit amet ipsum neque. Aenean blandit cursus lorem non gravida. Mauris nec convallis felis. Mauris ac tellus luctus odio venenatis aliquam quis a metus. Nullam tortor augue, tempor ut aliquet ac, blandit congue turpis. Nulla tincidunt viverra tempor.", 0, 0, 0, 0, false),
      new Text(2, "Nullam elementum tellus in laoreet placerat. Duis sed tortor quis mi molestie facilisis id et lorem. Duis a feugiat nulla, vel elementum nisl. Etiam sed turpis lacinia, mollis sapien dapibus, commodo odio. Morbi odio neque, mattis at justo eu, tincidunt pulvinar metus. Cras vitae justo eu urna tempor tincidunt vestibulum sit amet tortor. Pellentesque at congue massa. Quisque luctus eros in purus lacinia tincidunt. Ut faucibus vehicula risus at aliquet. Curabitur massa turpis, ullamcorper ac nisl ut, finibus blandit elit. In semper sagittis dolor, nec tincidunt ligula maximus quis. Donec faucibus posuere malesuada. Nam a porta urna, nec lacinia libero. Aliquam vitae tincidunt tortor.", 0, 0, 0, 0, false),
      new Text(3, "Duis leo lectus, vestibulum vel turpis eget, porta pharetra erat. Suspendisse potenti. Donec eros lectus, tempus ut efficitur vitae, mollis eget nisi. Sed sodales nunc vel nunc pharetra, ut sollicitudin lorem porta. Phasellus rutrum aliquam massa, vel hendrerit sapien sollicitudin feugiat. Ut mollis varius tincidunt. Quisque dignissim viverra justo vitae tristique. Sed auctor magna et enim efficitur mollis. Praesent sodales elit in est accumsan, at auctor est luctus. Quisque mollis vulputate nulla ut dapibus. Vivamus efficitur ultrices vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id sapien nec sem ultrices malesuada. Curabitur consectetur, tortor non fringilla efficitur, felis lectus venenatis elit, eget feugiat libero justo eu massa. Fusce at lacinia quam.", 0, 0, 0, 0, false),
      new Text(4, "Proin tempus in diam id aliquet. Curabitur scelerisque fermentum nulla eu tempor. Nullam rhoncus a metus ut efficitur. Phasellus lectus diam, pellentesque eu tempus non, molestie eleifend mi. Nullam bibendum iaculis leo, nec varius lectus ultricies sed. Nulla bibendum at ante pharetra pellentesque. Ut pulvinar, nunc mattis placerat sodales, elit odio cursus augue, quis maximus felis urna at urna. Ut dictum leo leo, et pellentesque arcu imperdiet sed. Donec eleifend metus id tortor ornare viverra. Suspendisse potenti. Sed et rhoncus turpis. In maximus nibh risus, eget dictum orci tempus sed. Phasellus sed arcu massa.", 0, 0, 0, 0, false),
    ]
   }
  
  /*{
      this.setMockData();
    }
   public saveContent() {
    this.socket.emit('createContent', {username: username, title: title});
   }
   */
	/*
  public registerSocket(user: User) {
    this.socket.emit('register', user);
  }
  */
}

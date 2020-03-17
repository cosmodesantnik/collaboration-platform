import { Component, OnInit, OnDestroy, Input  } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router"
import { Subscription } from 'rxjs';

import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  /*****************************************************************************
   *  VARIABLES
   ****************************************************************************/
  private sub: Subscription;
  public description: string;

  /*****************************************************************************
   *  MAIN
   ****************************************************************************/
  constructor(
    private activeRouter: ActivatedRoute,
    private router: Router,
    private cs: ContentService
  ) { 

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /*****************************************************************************
   *  MAIN
   ****************************************************************************/

  public save(): void {
    this.cs.saveEditorText();
  }

  update() {
    console.log(this.cs.editorText);
  }


}
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Node } from './node.class';

@Injectable()
export class ReturnsJsonArrayService {

  constructor(private http: Http) {}

  getCubes(fileName: string): Promise<Node[]> {

    return this.http.get(fileName)
      .map((res:Response) => res.json())
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
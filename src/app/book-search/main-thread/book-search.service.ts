import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { auditTime, share, shareReplay, switchMap } from "rxjs/operators";
import {
  getAccumulatedSearchResults,
  SearchResults
} from "../common/book-search.utils";
import { BookChoice } from "./book-search.component";

@Injectable({
  providedIn: "root"
})
export class BookSearchService {
  arr: string[] = [];
  constructor(private http: HttpClient) {}

  public search(
    bookSelection$: Observable<BookChoice>,
    searchTerm$: Observable<string>
  ): Observable<SearchResults> {
    return this.processSearch(bookSelection$, searchTerm$).pipe(
      auditTime(1000 / 60), // emit results at a maximum of 60fps
      share()
    );
  }

  protected processSearch(
    url$: Observable<string>,
    search$: Observable<string>
  ): Observable<SearchResults> {
    const sharedSearchTerm$ = search$.pipe(shareReplay(1));

    return url$.pipe(
      switchMap(url => this.http.get(url, { responseType: "text" })),
      switchMap(bookText => {
        return sharedSearchTerm$.pipe(
          switchMap(searchTerm => {
            // for (let index = 0; index < 5000; index++) {
            //   this.arr = ['test', ...this.arr];

            //   console.log('arr', this.arr);
            // }
            // console.log('search service', this.arr);
            return getAccumulatedSearchResults(searchTerm, bookText, []);
          })
        );
      })
    );
  }
}

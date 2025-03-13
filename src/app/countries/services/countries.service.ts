import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { Country } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private apiUrl:string= 'https://restcountries.com/v3.1';

  public cacheStore: CacheStore ={
    byCapital:   {term:'', countries: [] },
    byCountries: {term:'', countries: [] },
    byRegion:    {region:'', countries:[] }
  }


  private  getCountriesReques(url:string):Observable<Country[]>{

    return this.http.get<Country[]>( url )

    .pipe(
      catchError(error =>of ([])  ),
      // delay( 2000 ),
     ) ;


  }
  
  constructor(private http: HttpClient) { 
    this.loadFromlocalStorrage();

  }


  private saveToLocalStore(){
    localStorage.setItem('cacheStore', JSON.stringify(this.cacheStore));

  }
  private loadFromlocalStorrage(){

    if(!localStorage.getItem('cacheStore'))return;

    this.cacheStore = JSON.parse(  localStorage.getItem('cacheStore')!);

  }


  searchCountryByAlphaCode(code:string) : Observable<Country | null> {

    const url = `${this.apiUrl }/alpha/${code}`;

    return this.http.get<Country[]>( url )
          .pipe(
            map( countries => countries.length > 0 ? countries [0]: null),
            catchError( () =>of (null )  )
           );
  }


  searchCapital( term:string ): Observable<Country[]> {
    const url = `${this.apiUrl }/capital/${term}`;
    return this.getCountriesReques( url )
          .pipe(
            tap( countries => this.cacheStore.byCapital = {term, countries}),
            tap(() => this.saveToLocalStore())
          );
  }

  searchCountry(term : string ): Observable<Country[]> {
    const url = `${this.apiUrl }/name/${term}`;
    return this.getCountriesReques( url )
    .pipe(
      tap( countries => this.cacheStore.byCountries = {term, countries}),
      tap(() => this.saveToLocalStore())
    );;
  }


  searchRegion(region: Region):  Observable<Country[]> {
    const url = `${this.apiUrl }/region/${region}`;
    return this.getCountriesReques( url )
    .pipe(
      tap( countries => this.cacheStore.byRegion = {region, countries}),
      tap(() => this.saveToLocalStore())
    );;
  ;
  }

}
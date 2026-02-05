import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
  pincode: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationApiService {
  private popularCities: City[] = [
    { id: 'MUM', name: 'Mumbai', state: 'Maharashtra' },
    { id: 'DEL', name: 'New Delhi', state: 'Delhi' },
    { id: 'BLR', name: 'Bangalore', state: 'Karnataka' },
    { id: 'HYD', name: 'Hyderabad', state: 'Telangana' },
    { id: 'CHN', name: 'Chennai', state: 'Tamil Nadu' },
    { id: 'KOL', name: 'Kolkata', state: 'West Bengal' },
    { id: 'PUN', name: 'Pune', state: 'Maharashtra' },
    { id: 'AMD', name: 'Ahmedabad', state: 'Gujarat' },
  ];

  private areasByCity: { [cityId: string]: Area[] } = {
    'MUM': [
      { id: 'MUM_BAN', name: 'Bandra', cityId: 'MUM', pincode: '400050' },
      { id: 'MUM_ANH', name: 'Andheri', cityId: 'MUM', pincode: '400053' },
      { id: 'MUM_POW', name: 'Powai', cityId: 'MUM', pincode: '400076' },
      { id: 'MUM_DAD', name: 'Dadar', cityId: 'MUM', pincode: '400028' },
      { id: 'MUM_KUR', name: 'Kurla', cityId: 'MUM', pincode: '400070' },
    ],
    'DEL': [
      { id: 'DEL_CP', name: 'Connaught Place', cityId: 'DEL', pincode: '110001' },
      { id: 'DEL_DW', name: 'Dwarka', cityId: 'DEL', pincode: '110075' },
      { id: 'DEL_SDA', name: 'Saket', cityId: 'DEL', pincode: '110017' },
      { id: 'DEL_RKP', name: 'Rajouri Garden', cityId: 'DEL', pincode: '110027' },
    ],
    'BLR': [
      { id: 'BLR_KOR', name: 'Koramangala', cityId: 'BLR', pincode: '560034' },
      { id: 'BLR_IND', name: 'Indiranagar', cityId: 'BLR', pincode: '560038' },
      { id: 'BLR_WHI', name: 'Whitefield', cityId: 'BLR', pincode: '560066' },
      { id: 'BLR_JAY', name: 'Jayanagar', cityId: 'BLR', pincode: '560041' },
    ],
    'HYD': [
      { id: 'HYD_HIT', name: 'HITEC City', cityId: 'HYD', pincode: '500081' },
      { id: 'HYD_MAD', name: 'Madhapur', cityId: 'HYD', pincode: '500081' },
      { id: 'HYD_BAN', name: 'Banjara Hills', cityId: 'HYD', pincode: '500034' },
      { id: 'HYD_KUK', name: 'Kukatpally', cityId: 'HYD', pincode: '500072' },
    ],
    'CHN': [
      { id: 'CHN_ANN', name: 'Anna Nagar', cityId: 'CHN', pincode: '600040' },
      { id: 'CHN_TNA', name: 'T. Nagar', cityId: 'CHN', pincode: '600017' },
      { id: 'CHN_VEL', name: 'Velachery', cityId: 'CHN', pincode: '600042' },
      { id: 'CHN_OMR', name: 'OMR', cityId: 'CHN', pincode: '600119' },
    ],
    'KOL': [
      { id: 'KOL_SLC', name: 'Salt Lake', cityId: 'KOL', pincode: '700064' },
      { id: 'KOL_PAR', name: 'Park Street', cityId: 'KOL', pincode: '700016' },
      { id: 'KOL_ALI', name: 'Alipore', cityId: 'KOL', pincode: '700027' },
    ],
    'PUN': [
      { id: 'PUN_KOR', name: 'Koregaon Park', cityId: 'PUN', pincode: '411001' },
      { id: 'PUN_VIM', name: 'Viman Nagar', cityId: 'PUN', pincode: '411014' },
      { id: 'PUN_HIN', name: 'Hinjewadi', cityId: 'PUN', pincode: '411057' },
      { id: 'PUN_BAN', name: 'Baner', cityId: 'PUN', pincode: '411045' },
    ],
    'AMD': [
      { id: 'AMD_SG', name: 'SG Highway', cityId: 'AMD', pincode: '380015' },
      { id: 'AMD_NAV', name: 'Navrangpura', cityId: 'AMD', pincode: '380009' },
      { id: 'AMD_BOD', name: 'Bodakdev', cityId: 'AMD', pincode: '380054' },
    ],
  };

  getPopularCities(): Observable<{ data: City[] }> {
    return of({ data: this.popularCities });
  }

  getAreas(cityId: string): Observable<{ data: Area[] }> {
    const areas = this.areasByCity[cityId] || [];
    return of({ data: areas });
  }

  searchCities(query: string): Observable<{ data: City[] }> {
    const results = this.popularCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
    return of({ data: results });
  }
}
